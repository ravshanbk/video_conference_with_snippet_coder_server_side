const { error } = require("console");
const meetingServices = require("../services/meeting.service");
const { MeetingPayloadEnum } = require("../utils/meeting-payload.enum");
const { type } = require("os");
const { use } = require("../routes/app.routes");


async function joinMeeting(meetingId, socket, meetingServer, payload) {
    const { userId, name } = payload.data;
    console.log('<<<<<  joinMeeting   >>>>>>>');
    console.log(userId);
    console.log(name);
    meetingServices.isMeetingPresentt(meetingId, async (error, results) => {
        if (error && !result) {
            sendMessage(socket, {
                type: MeetingPayloadEnum.NOT_FOUND
            });
        }
        if (results) {
            addUser(socket, { meetingId, userId, name }).then((result) => {
                if (result) {
                    sendMessage(socket, {
                        type: MeetingPayloadEnum.JOINED_MEETING, data: {
                            userId
                        }
                    });

                    /// NOte
                    broadcastUser(meetingId, socket, meetingServer, {
                        type: MeetingPayloadEnum.USER_JOINED,
                        data: {
                            userId,
                            name,
                            ...payload.data
                        }
                    });
                }

            }, (error) => {
                console.log(error);
            });

        }
    });
}

function forwardConnectionRequest(meetingId, socket, meetingServer, payload) {
    const { userId, otherUserId, name } = payload.data;
    var model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model, (error, result) => {
        if (result) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.CONNECTION_REQUEST,
                data: {
                    userId, name, ...payload.data,
                }
            });
            meetingServer.to(result.socketId).emit("message", sendPayload);
        }
    });
}
function forwardIceCandidate(meetingId, socket, meetingServer, payload) {
    const { userId, otherUserId, candidate } = payload.data;
    var model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model, (error, result) => {
        if (result) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.ICECANDIDATE,
                data: {
                    userId, candidate,
                }
            });
            meetingServer.to(result.socketId).emit("message", sendPayload);
        }
    });
}
function forwardOfferSDP(meetingId, socket, meetingServer, payload) {
    const { userId, otherUserId, sdp } = payload.data;
    var model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model, (error, result) => {
        if (result) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.OFFER_SDP,
                data: {
                    userId, sdp,
                }
            });
            meetingServer.to(result.socketId).emit("message", sendPayload);
        }
    });
}
function forwardAnswerSDP(meetingId, socket, meetingServer, payload) {
    const { userId, otherUserId, sdp } = payload.data;
    var model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model, (error, result) => {
        if (result) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.ANSWER_SDP,
                data: {
                    userId, sdp,
                }
            });
            meetingServer.to(result.socketId).emit("message", sendPayload);
        }
    });
}
function userLeft(meetingId, socket, meetingServer, payload) {
    const { userId } = payload.data;

    broadcastUser(meetingId, socket, meetingServer, {
        type: MeetingPayloadEnum.USER_LEFT, data: {
            userId: userId,
        }
    });
}
function endMeeting(meetingId, socket, meetingServer, payload) {
    const { userId } = payload.data;

    broadcastUser(meetingId, socket, meetingServer, {
        type: MeetingPayloadEnum.MEETING_ENDED, data: {
            userId: userId,
        }
    });
    meetingServices.getAllMeetingUserss(meetingId, (error, results) => {
        for (let i = 0; i < results.length; i++) {
            const meetingUser = results[i];
            meetingServer.sockets.connected[meetingUSer.socketId].disconnect();

        }
    });
}
function forwardEvent(meetingId, socket, meetingServer, payload) {
    const { userId } = payload.data;

    broadcastUser(meetingId, socket, meetingServer, {
        type: payload.type, data: {
            userId: userId,
            ...payload.data,
        }
    });

}


function addUser(socket, { meetingId, userId, name }) {
    console.log('<<<<<  ADD USER >>>>>>')
    console.log(meetingId);
    console.log(userId);
    console.log(name);
    let promise = new Promise(function (resolve, reject) {
        meetingServices.getMeetingUser({ meetingId, userId }, (error, result) => {
            if (!result) {
                var model = {
                    socketId: socket.id,
                    meetingId: meetingId,
                    userId: userId,
                    joined: true,
                    name: name,
                    isAlive: true,
                };
                meetingServices.joinMeeting(model, (error, result) => {
                    if (result) {
                        resolve(result);
                    }
                    if (error) {
                        reject(error);
                    }
                });


            }
            else {
                meetingServices.updateMeetingUser({ userId: userId, socketId: socket.id, }, (error, result) => {
                    if (result) {
                        resolve (true);
                    }
                    if (error) {
                        reject(error);
                    }
                });
            }

        });
    });
    return promise;
}

function sendMessage(socket, payload) {
    socket.send(JSON.stringify(payload));
}

function broadcastUser(meetingId, socket, meetingServer, payload) {
    socket.broadcast.emit("message", JSON.stringify(payload));


}

module.exports = {
    joinMeeting,
    forwardConnectionRequest,
    forwardIceCandidate,
    forwardOfferSDP,
    forwardAnswerSDP,
    userLeft,
    endMeeting,
    forwardEvent,
}