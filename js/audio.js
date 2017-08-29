function ReturnSoundObject(path) {
    let s = new Audio(path);
    return {
        play: function () {
            s.play();
        },
        pause: function () {
            s.pause();
        },
        restart: function () {
            s.pause();
            s.currentTime = 0;
        }
    }
}

var messageNotificationSound = ReturnSoundObject('sound/message-notification.mp3');
var callingFriend = ReturnSoundObject('sound/callingtone.mp3');
var ringtone = ReturnSoundObject('sound/ringtone.mp3');