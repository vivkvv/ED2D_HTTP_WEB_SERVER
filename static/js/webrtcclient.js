    var config = {"iceServers":[{"url":"stun:stun.l.google.com:19302"}]};	
	//var connection = {};// { 'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true }] };
	var clientConnection = {};// 'optional': [{'DtlsSrtpKeyAgreement': true}] };
	var clientDataChannelOptions = {ordered: true, maxRetransmits: 1};
	
	var peerClientConnection;
	var clientDataChannel;	

	function processClientOffer(offer, gameId, onSendNegotiationToAdmin) {
		console.log("--- PROCESSED CLIENT OFFER ---");		
		openClientDataChannel(gameId, onSendNegotiationToAdmin);
		clientPeerConnection.setRemoteDescription(new RTCSessionDescription(offer)).catch(e => {
			console.log(e);
		});
		
		var sdpConstraints = {'mandatory':
	        {
    	        'OfferToReceiveAudio': false,
        	    'OfferToReceiveVideo': false
        	}
    	};
		
		clientPeerConnection.createAnswer(sdpConstraints).then(function(sdp) {
			console.log("--- PROCESSED CLIENT CREATE ANSWER ---");
			return clientPeerConnection.setLocalDescription(sdp).then(function() {
				sendNegotiationToAdmin("answer", sdp, gameId, onSendNegotiationToAdmin);
				console.log("--- SEND ANSWER TO ADMIN ---");
			})
		}, function(err) {
			console.log(err);
		});	
	}
	
	function processClientAnswer(answer) {
		console.log("--- PROCESSED CLIENT ANSWER ---");		
		clientPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
		return true;
	}
	
	
	function processClientIce(iceCandidate) {
		console.log("--- PROCESSED CLIENT ICE CANDIDATE ---");
		clientPeerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate)).catch(e => {
			console.log(e);
		})
	}
	
	function openClientDataChannel(gameId, onSendNegotiationToAdmin) {
		console.log("--- PROCESSED CLIENT OPEN DATA CHANNEL ---");		
		clientPeerConnection = new RTCPeerConnection(config, clientConnection);
		clientPeerConnection.onicecandidate = function(e) {
			console.log("--- PROCESSED CLIENT ONICECANDIDATE ---");			
			if (!clientPeerConnection || !e || !e.candidate)
				return;
			var candidate = event.candidate;
			sendNegotiationToAdmin("candidate", candidate, gameId, onSendNegotiationToAdmin);			
		}
		
		clientDataChannel = clientPeerConnection.createDataChannel("clientdatachannel", clientDataChannelOptions);
		
		clientDataChannel.onopen = function(e) {
			console.log("----- CLIENT DATACHANNEL OPENED -----");
			clientDataChannel.send("send from clientDataChannel - clientDataChannel.onopen");
		} 
		
		clientDataChannel.onclose = function(e) {
			console.log("----- CLIENT DATACHANNEL CLOSED -----");
		}
		
		clientDataChannel.onerror = function(e) {
			console.log("----- CLIENT DATACHANNEL ERROR -----");
		}
		
		clientDataChannel.onmessage = function(e) {
			console.log("----- CLIENT DATACHANNEL MESSAGE -----" + e.data);		
		}
		
		clientPeerConnection.ondatachannel = function (ev) {
            console.log('clientPeerConnection.ondatachannel event fired.');
            ev.channel.onopen = function() {
    			clientDataChannel.send("send from clientDataChannel - ev.channel.onopen");            	
                console.log('Client data channel is open and ready to be used.');
            };
            ev.channel.onmessage = function(e){
            	var message = proto.WebRTCAdminToClientMessage.deserializeBinary(e.data);
            	if(message.hasRtcgameinfo()) {
            		var rtcGameInfo = message.getRtcgameinfo();
            		////location.href = rtcGameInfo.getUrl(); 
            	}
            	else {
            		console.log("unknown message from the admin:" + e.data);
            	}
            }
        };

        return clientPeerConnection;				
	}
	

	
	function sendNegotiationToAdmin(type, sdp, gameId, onSendNegotiationToAdmin) {
		console.log("--- SEND NEGOTIATION TO ADMIN ---");		
		var json = { from: "Client", to: "Admin", action: type, data: sdp};			
		var message = new proto.ClientQueryRequest();
		var rtcClient2AdminAnswer = new proto.RTCClient2AdminAnswer();
		rtcClient2AdminAnswer.setGamertcid(gameId);
		rtcClient2AdminAnswer.setAnswer(JSON.stringify(json));
		message.setRtcanswer(rtcClient2AdminAnswer);
		var binary = message.serializeBinary();
		onSendNegotiationToAdmin(gameId, type, binary);
	}
	