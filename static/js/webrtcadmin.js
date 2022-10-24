    var config = {"iceServers":[{"url":"stun:stun.l.google.com:19302"}]};	
	//var connection = {};// { 'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true }] };
    var webRTCGameID = -1;
    var webServerAdress = "";
    var currentXmlGame = "";
	var adminConnection = {};// 'optional': [{'DtlsSrtpKeyAgreement': true}] };
	var adminDataChannelOptions = {reliable: true};
	
	var peerAdminConnection;
	var adminDataChannel;
	
	function processAdminAnswer(answer) {
		console.log("--- PROCESSED ADMIN ANSWER ---");		
		adminPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
		return true;
	}
	
	function processAdminIce(iceCandidate) {
		console.log("--- PROCESSED ADMIN ICE CANDIDATE ---");		
		adminPeerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate)).catch(e => {
			console.log(e);
		})
	}	
		
	function openAdminDataChannel(gameId, onSendNegotiationToClients) {
		console.log("--- PROCESSED ADMIN OPEN DATA CHANNEL ---");		
		adminPeerConnection = new RTCPeerConnection(config, adminConnection);
		adminPeerConnection.onicecandidate = function(e) {
			console.log("--- PROCESSED ADMIN ONICECANDIDATE ---");			
			if (!adminPeerConnection || !e || !e.candidate)
				return;
			var candidate = event.candidate;
			sendNegotiationToClients("candidate", candidate, gameId, onSendNegotiationToClients);			
		}
		
		adminDataChannel = adminPeerConnection.createDataChannel("admindatachannel", adminDataChannelOptions);
		
		adminDataChannel.onopen = function(e) {
			console.log("----- ADMIN DATACHANNEL OPENED -----");
			//adminDataChannel.send("send from adminDataChannel - adminDataChannel.onopen");
		} 
		
		adminDataChannel.onclose = function(e) {
			console.log("----- ADMIN DATACHANNEL CLOSED -----");
		}
		
		adminDataChannel.onerror = function(e) {
			console.log("----- ADMIN DATACHANNEL ERROR -----");
		}
		
		adminDataChannel.onmessage = function(e) {
			console.log("----- ADMIN DATACHANNEL MESSAGE -----" + e.data);		
		}
		
		adminPeerConnection.ondatachannel = function (ev) {
            console.log('adminPeerConnection.ondatachannel event fired.');
            ev.channel.onopen = function() {
                console.log('Data channel is open and ready to be used.');
    			// adminDataChannel.send("send from adminDataChannel - ev.channel.onopen");
    			// start game
                // 1. load game's html
                var newLocation = "http://" + webServerAdress + ":8080/?btnGame=PLAY&selectedPort=0&webRTCGameID=" + webRTCGameID;
                ////location.href = newLocation;                
                // 2. send mesage to the client to start a game
                var message = new proto.WebRTCAdminToClientMessage();
                var rtcGameInfo = new proto.WebRTCGameInfo();
                rtcGameInfo.setUrl(newLocation);
                rtcGameInfo.setGameid(webRTCGameID);
                rtcGameInfo.setForcepalette("");
                rtcGameInfo.setEqpotpalette("");
                message.setRtcgameinfo(rtcGameInfo);
                var binary = message.serializeBinary();
                adminDataChannel.send(binary);
                
                // take all parameters from currentXmlGame
                // 3. send start conditions to all the players
                var sceneGeometry = new proto.SceneGeometry();
        		var gameWidth = $(currentXmlGame).find('Width')[0].textContent;
        		var gameHeight = $(currentXmlGame).find('Height')[0].textContent;                
                sceneGeometry.setWidth(gameWidth);
                sceneGeometry.setHeight(gameHeight);
                sceneGeometry.setQulon(0.5);//mQulon);
                sceneGeometry.setLightvelocity(2.0);//mC);
                sceneGeometry.setIfmagnetic(false);//mBCalculated);
                
                var forces = $(currentXmlGame).find('Forces')[0];
                
                var forcesShowStruct = new proto.ShowStruct();
                //forces.children[0].tagName; // "PaletteType"
                //forces.children[0].innerHtml; // "discrete"
                if(forces.children[0].innerHTML == "discrete")
                	forcesShowStruct.setPalettetype(0);
                else
                	forcesShowStruct.setPalettetype(1);
                forcesShowStruct.setPalettename(forces.children[0].innerHTML);               
                
                var eqPotShowStruct = new proto.ShowStruct();
                if(forces.children[1].innerHTML == "discrete")
                	eqPotShowStruct.setPalettetype(0);
                else
                	eqPotShowStruct.setPalettetype(1);
                eqPotShowStruct.setPalettename(forces.children[1].innerHTML);
                
                sceneGeometry.setForcesshowstruct(forcesShowStruct);                
                sceneGeometry.setEqpotentialsshowstruct(eqPotShowStruct);
                
                var gameInfo = new proto.GameInfo();
                gameInfo.setGeometry(sceneGeometry);
                gameInfo.setCurrentchargeid(webRTCGameID);
                
                var rwtcm = new proto.RoomWrappedToClientMessage();
                rwtcm.setGameinfo(gameInfo);
               
                var binary = rwtcm.serializeBinary();
                adminDataChannel.send(binary);
                
                // 4. send all parameters to all the players
                
                // in the cycle
                // 5. calculate new state
                // 6. send all parameters to all the players
 
            };
            ev.channel.onmessage = function(e){
                console.log("message from the client: " +e.data);
            }
        };

        return adminPeerConnection;		
	}
	
	function sendNegotiationToClients(type, sdp, gameId, onSendNegotiationToClients) {
		console.log("--- SEND NEGOTIATION TO CLIENTS ---");		
		var json = { from: "Admin", to: "Clients", action: type, data: sdp};			
		var message = new proto.ClientQueryRequest();
		var rtcAdmin2ClientOffer = new proto.RTCAdmin2ClientOffer();
		rtcAdmin2ClientOffer.setGamertcid(gameId);
		rtcAdmin2ClientOffer.setOffer(JSON.stringify(json));
		message.setRtcoffer(rtcAdmin2ClientOffer);
		var binary = message.serializeBinary();
		onSendNegotiationToClients(gameId, type, binary);
	}

	
	function connectToRTCClients(gameId, serverIP, xmlGame, onSendNegotiationToClients) {
		webRTCGameID = gameId;
		webServerAdress = serverIP;
		currentXmlGame = xmlGame;
		console.log("--- CONNECTION TO RTC CLIENTS ---");		
        openAdminDataChannel(gameId, onSendNegotiationToClients);
        
        var sdpConstraints = {'mandatory':
        	{
        		'OfferToReceiveAudio': false,
        		'OfferToReceiveVideo': false
        	}
        };
               
        adminPeerConnection.createOffer(sdpConstraints).then(function(sdp) {
    		console.log("--- ADMIN CONNECTION. CREATE OFFER ---");        	
        	adminPeerConnection.setLocalDescription(sdp);
        	sendNegotiationToClients("offer", sdp, gameId, onSendNegotiationToClients);
        	console.log("----- SEND OFFER -----");
        }, function(err) {
        	console.log(err);
        });
    }
