from google.appengine.ext import ndb

class RTCGame(ndb.Model):
    gameID = ndb.StringProperty()

class RTCOffer(ndb.Model):
    #game = ndb.StructuredProperty(RTCGame)
    offer = ndb.BlobProperty()
    
class RTCReadOffer(ndb.Model):
    offer = ndb.StructuredProperty(RTCOffer)
    readBy = ndb.StringProperty()

class RTCOfferCandidate(ndb.Model):
    #game = ndb.StructuredProperty(RTCGame)
    candidate = ndb.BlobProperty()
    
class RTCReadOfferCandidates(ndb.Model):
    offerCandidate = ndb.StructuredProperty(RTCOfferCandidate)
    readBy = ndb.StringProperty()

class RTCAnswer(ndb.Model):
    #game = ndb.StructuredProperty(RTCGame)
    #client = ndb.StringProperty()
    answer = ndb.BlobProperty()

class RTCAnswerCandidate(ndb.Model):
    #answer = ndb.StructuredProperty(RTCAnswer)
    candidate = ndb.BlobProperty()
    
class RTCReadAnswerCandidate(ndb.Model):
    answerCandidate = ndb.StructuredProperty(RTCAnswerCandidate)
    read = ndb.BooleanProperty()
    
@ndb.transactional
def createRTCGame(gameID):
    game = RTCGame(gameID = gameID)
    return game.put()

@ndb.transactional(xg=True)
def createRTCOffer(gameID, offer):
    #game = RTCGame(gameID = gameID)
    #gameKey = game.put()
    #newOffer = RTCOffer(game = gameKey.get(), offer = offer)
    #newOffer.put()    
    newOffer = RTCOffer(parent = ndb.Key("GameID", gameID),
                        offer = offer)
    newOffer.put()
     

@ndb.transactional
def createOfferCandidate(gameID, offerCandidate):
    #game = RTCGame.query(gameID == gameID)
    #newOfferCandidate = RTCOfferCandidate(game = game, candidate = offerCandidate)
    newOfferCandidate = RTCOfferCandidate(parent = ndb.Key("GameID", gameID),
                                          candidate = offerCandidate)
    newOfferCandidate.put() 

@ndb.transactional
def getNextOfferCandidate(gameID):
    ancestorKey = ndb.Key("GameID", gameID)
    query = RTCOfferCandidate.query(ancestor = ancestorKey)
    retValue = ""
    candidate = query.fetch(1)
    if(len(candidate) == 0):
        return retValue
    
    retValue = candidate[0].candidate
    if(retValue != ""):
        for q in query:
            q.key.delete()
    return retValue

@ndb.transactional
def createAnswer(gameID, answer):
    #game = RTCGame.query(gameID == gameID)
    newAnswer = RTCAnswer(parent = ndb.Key("GameID", gameID),
                          answer = answer)
    newAnswer.put()

@ndb.transactional
def createAnswerCandidate(gameID, answerCandidate):
    #answer = RTCAnswer.query(gameID == gameID)
    answerCandidate = RTCAnswerCandidate(parent = ndb.Key("GameID", gameID),
                                         candidate = answerCandidate)
    answerCandidate.put()
    
#@ndb.transactional    
def getNextAnswerCandidate(gameID):
    ancestorKey = ndb.Key("GameID", gameID)
    query = RTCAnswerCandidate.query(ancestor = ancestorKey)
    retValue = ""
    answerCandidate = query.fetch(1)
    if(len(answerCandidate) == 0):
        return retValue
    
    retValue = answerCandidate[0].candidate
    if(retValue != ""):
        for q in query:
            q.key.delete()
    return retValue
    
#@ndb.transactional
def getOffer(gameID):
    ancestorKey = ndb.Key("GameID", gameID)
    query = RTCOffer.query(ancestor = ancestorKey)
    retValue = ""
    offer = query.fetch(1)
    if(len(offer) == 0):
        return retValue
    
    retValue = offer[0].offer
    if(retValue != ""):
        for q in query:
            q.key.delete()
    return retValue

@ndb.transactional
def getAnswer(gameID):
    ancestorKey = ndb.Key("GameID", gameID)
    query = RTCAnswer.query(ancestor = ancestorKey)
    retValue = ""
    answer = query.fetch(1)
    if(len(answer) ==0):
        return retValue
    
    retValue = answer[0].answer
    if(retValue != ""):
        for q in query:
            q.key.delete()
    return retValue