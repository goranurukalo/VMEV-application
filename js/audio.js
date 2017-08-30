function ReturnSoundObject(path, loop = false) {
    let s = new Audio(path);
    s.loop = loop;
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
var callingFriend = ReturnSoundObject('sound/callingtone.mp3', true);
var ringtone = ReturnSoundObject('sound/ringtone.mp3', true);