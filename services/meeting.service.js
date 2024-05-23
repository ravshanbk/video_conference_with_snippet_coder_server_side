const { meeting } = require("../models/meeting.model");
const { meetingUser } = require("../models/meeting-user.model");

async function getAllMeetingUserss(meetId, callback) {
    meetingUser.find({ meetingId: meetId }).then((response) => {

        return callback(null, response);
    }).catch((error) => {
        return callback(error);
    });
}

async function startMeeting(params, callback) {
    const meetingSchema = new meeting(params);

    meetingSchema.save().then((response) => {
        return callback(null, response)
    }).catch((error) => {
        return callback(error);
    });
}
async function addUserToAnExistingMeeting(meetingId, userId, callback) {
    try {
        const m = await meeting.findById(meetingId);

        if (m) {
            m.meetingUsers.push(userId);
            await m.save();
            console.log('Meeting updated:', m);
            callback(m);
        } else {
            console.log('Meeting not found');
        }
    } catch (error) {
        console.error('Error updating meeting:', error);
    }
}


async function joinMeeting(params, callback) {

    console.log('<<<< join meeting >>>>');
    console.log(params);
    const meetingUserModel = new meetingUser(params);
    meetingUserModel.save().then(async (response) => {
        console.log('<<<<< meeting after update >>>>>>');
        console.log(params.meetingId);
        console.log(meeting.findById(params.meetingId))
        await meeting.findOneAndUpdate({ id: params.meetingId }, {
            $addToSet: { "meetingUsers": meetingUserModel }
        });
        return callback(null, response);
    }).catch((error) => {
        return callback(error);
    });
}

async function isMeetingPresentt(meetingId, callback) {


    meeting.findById(meetingId).populate("meetingUsers", "MeetingUser").then((response) => {
        if (!response) callback("Invalid Meeting Id");
        else callback(null, true);
    }).catch((error) => {
        return callback(error, false)
    });
}
async function chekMeetingExists(meetingId, callback) {


    meeting.findById(meetingId)
        .populate("meetingUsers", "MeetingUser")
        .then((response) => {
            if (!response) {
                callback("Invalid Meeting Id");
            }
            else {

                console.log('populated meeting');
                console.log(response);
                callback(null, response);
            }
        }).catch((error) => {
            return callback(error, false)
        });
}

async function getMeetingUser(params, callback) {
    const { meetingId, userId } = params;
    meetingUser.find({ meetingId, userId }).then((response) => {
        console.log('get meeting user');
        console.log(response);
        console.log('///\\\///\\\///\\');
        return callback(null, response[0]);
    }).catch((error) => {
        return callback(error);
    });
}


async function updateMeetingUser(params, callback) {
    console.log('update user');
    console.log(params);
    meetingUser
        .updateOne({ userId: params.userId }, { $set: params }, { new: true })
        .then((response) => {
            return callback(null, response);
        })
        .catch((error) => {
            return callback(error);
        });
}


async function getUserBySocketId(params, callback) {
    console.log('get user by socket id');
    console.log(params);
    const { meetingId, socketId } = params;
    meetingUser
        .find({ meetingId, socketId })
        .limit(1)
        .then((response) => {
            return callback(null, response);
        })
        .catch((error) => {
            return callback(error);
        });
}

module.exports = {
    startMeeting,
    joinMeeting,
    getAllMeetingUserss,
    isMeetingPresentt,
    chekMeetingExists,
    getUserBySocketId,
    updateMeetingUser,
    getMeetingUser, addUserToAnExistingMeeting,

}