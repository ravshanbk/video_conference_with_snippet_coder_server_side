
const meetingServices = require("../services/meeting.service");

exports.startMeeting = (req, res, next) => {
    console.log('start meeting');
    // console.log(req);
    // console.log(res);
    const { hostId, hostName } = req.body;
    var model = {
        hostId: hostId,
        hostName: hostName,
        startTime: Date.now()
    };

    meetingServices.startMeeting(model, (error, results) => {
        if (error) {
            return next(error);
        }
        console.log('start meeting result id');
        console.log(results.id);
        return res.status(200).send({
            message: "Success",
            data: meeting.id,
        });

    }

    )

}

exports.checkMeetingExists = (req, res, next) => {

    const { meetingId } = req.query;


    meetingServices.chekMeetingExists(meetingId, (error, results) => {
        if (error) {
            console.log('<<<<< check meeting exists error >>>>>>');
            console.log(error);
            return next(error);
        }
        console.log('>> meting exists <<');
        console.log(typeof results);
        return res.status(200).send({
            message: "Success",
            data: results
        });
    })

}

exports.getAllMeetingUsers = (req, res, next) => {
    const { meetingId } = req.query;
    console.log('getAllMeetingUsers');
    // console.log(req);
    // console.log(res);
    console.log(meetingId);

    meetingServices.getAllMeetingUsers(meetingId, (error, results) => {
        if (error) {
            return next(error);
        }

        return res.status(200).send({
            message: "Success",
            data: results
        });
    });
}