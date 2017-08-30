var _myPeerId = null;
var _myID = null;
var _acctiveCallInfo = {
    userId: null,
    userPeerId: null,
    muted: false,
    myVoiceMuted: false,
    type: null,
    RestartInfo: function () {
        this.userId = null;
        this.userPeerId = null;
        this.muted = false;
        this.type = null;
        this.myVoiceMuted = false;
        $('button.video-call').attr('data-video-call', false);
        $('button.voice-call').attr('data-voice-call', false);
    }
};
var _activeEditInfo = {
    userId: null,
    userPeerId: null,
    language: null,
    filePath: null,
    ResetInfo: function () {
        this.userId = null;
        this.userPeerId = null;
        this.language = null;
    }
};

var peer = new Peer({
    // Set API key for cloud server (you don't need this if you're running your
    // own.
    key: 'x7fwx2kavpy6tj4i',
    /*
    // Set highest debug level (log everything!).
    debug: 1,

    // Set a logging function:
    logFunction: function () {
        var copy = Array.prototype.slice.call(arguments).join(' ');
        console.log("PeerJS debuglog - " + copy);
    }
    */
});
var connectedPeers = {};

peer.on('open', function (id) {
    //obrisati posle
    _myPeerId = id;
    _ThisUserData.peerID = id;
});
peer.on('error', function (err) {
    console.log("PeerJS - " + err);
})


function ConnectWithFriends(myId, friendArray) {
    //podseti se da trebas da 
    _myID = myId;
    SendPeerToServer(myId, Date.now() + 60000);
    CheckConnectionsBettwenFriends(friendArray);
}


function SendPeerToServer(myId, time) {
    if (_myPeerId == null) {
        if (Date.now() > time) {
            alert("We have some problems with connections, please try later (in like 10min). Application will close itself.");
            ipcRenderer.send('close', "");
            return;
        }

        setTimeout(function () {
            SendPeerToServer(myId, time);
        }, 500);

        return;
    }

    $.ajax({
        url: "https://vmev.herokuapp.com/setMyPeer",
        type: "post",
        data: JSON.stringify({
            peerID: _myPeerId.toString(),
            _id: myId.toString()
        }),
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            //alert("upisao PeerID");
        },
        error: function (err) {
            alert("Nesto nevalja kod upisa PeerID-a");
        }
    });
}

function CheckConnectionsBettwenFriends(friendArray) {

    friendArray.forEach(function (el) {
        let requestedPeer = el.peerID;
        if (!connectedPeers[requestedPeer]) {
            // Create 2 connections, one labelled chat and another labelled file.
            let c = peer.connect(requestedPeer, {
                label: 'loggedin',
                serialization: 'json',
                metadata: {
                    message: '' + _myID
                }
            });
            let f = peer.connect(requestedPeer, {
                label: 'file',
                reliable: true
            });

            c.on('open', function () {
                connect(c);
                connectedPeers[requestedPeer] = el._id;
                let element = $('.person[data-person = ' + el._id + ']').find(".status-offline");
                element.removeClass("status-offline").addClass("status-online");
                element.next().text("Online");
            });
            c.on('error', function (err) {
                alert(err);
            });

            f.on('open', function () {
                connect(f);
            });
            f.on('error', function (err) {
                alert(err);
            });
        }
    });
}

function CheckConnectionWithFriend(requestedPeer, userId) {
    if (requestedPeer != null) {
        if (!connectedPeers[requestedPeer]) {
            // Create 2 connections, one labelled chat and another labelled file.
            let c = peer.connect(requestedPeer, {
                label: 'loggedin',
                serialization: 'json',
                metadata: {
                    message: '' + _myID,
                    FriendWhoAcceptedMe: _ThisUserData
                }
            });
            let f = peer.connect(requestedPeer, {
                label: 'file',
                reliable: true
            });

            c.on('open', function () {
                connect(c);
                connectedPeers[requestedPeer] = userId;
                let element = $('.person[data-person = ' + userId + ']').find(".status-offline");
                element.removeClass("status-offline").addClass("status-online");
                element.next().text("Online");
            });
            c.on('error', function (err) {
                alert(err);
            });

            f.on('open', function () {
                connect(f);
            });
            f.on('error', function (err) {
                alert(err);
            });
        }
    }

}

function SendNotificationForFriendRequest(requestedPeer) {
    if (!connectedPeers[requestedPeer]) {
        // Create 2 connections, one labelled chat and another labelled file.
        let c = peer.connect(requestedPeer, {
            label: 'friendRequest',
            serialization: 'json',
            metadata: {
                message: _ThisUserData
            }
        });
        /*
        c.on('open', function () {
            console.log('online je');
        });
        */
        c.on('error', function (err) {
            alert(err);
        });
    }
}

// Await connections from others
peer.on('connection', connect);

// Handle a connection object.
function connect(c) {
    if (c.label === 'loggedin') {
        if (c.metadata.FriendWhoAcceptedMe && c.metadata.FriendWhoAcceptedMe._id != _myID) {
            let _userData = c.metadata.FriendWhoAcceptedMe;
            let imgurl = _userData.imgUrl;
            if (imgurl) {
                imgurl = 'https://vmev.herokuapp.com/' + imgurl;
            } else {
                imgurl = 'images/app/default_user.png';
            }
            let uiPeerID = _userData.peerID || _userData._id;
            let newUser = "<li class='person' data-person='" + _userData._id + "' data-peerid='" + uiPeerID + "'>" +
                "<img src='" + imgurl + "'/>" +
                "<span class='name'>" + _userData.firstName + " " + _userData.lastName + "</span>" +
                "<div>" +
                "<span class='login-status status-online'></span>" +
                "<span class='status-text'>Online</span>" +
                "</div>" +
                "<div class='single-person-notification'></div>" +
                "</li>";

            let peopleMessages = "<div class='chat' data-chat='" + uiPeerID + "'></div>";


            $(".people").append(newUser);
            $(".message-container").prepend(peopleMessages);
            FriendsData.push({
                _id: _userData._id,
                peerID: uiPeerID
            });
        }
        let el = $('.person[data-person = ' + c.metadata.message + ']').find(".status-offline");
        //change peerID when someone login 
        let old_peer_id = $('.person[data-person = ' + c.metadata.message + ']').attr("data-peerid");
        $('.person[data-person = ' + c.metadata.message + ']').attr("data-peerid", c.peer);
        $('.chat[data-chat = ' + old_peer_id + ']').attr("data-chat", c.peer);

        el.removeClass("status-offline").addClass("status-online");
        el.next().text("Online");
        c.on('data', function (data) {
            if (data.type === 'edit') {
                //ovo treba da bude najbrze posto se najvise promena tj najvise puta se ovo koristi
                $editor.passDataToEditor(data.message);
            } else if (data.type === 'chat') {
                if ($("li.person.active").attr('data-peerid') != c.peer || tool != 'message') {
                    let person = $("li.person[data-peerid =" + c.peer + "] .single-person-notification");
                    if (person) {
                        messageNotificationSound.play();
                        //let num = person.find('span').text() || 0;
                        //num++;
                        //person.html("<span>" + num + "</span>");
                        person.html("<span></span>");
                    }
                }
                $('.chat[data-chat = ' + c.peer + ']').append("<div class='bubble you'>" + myEmojiRenderer(data.message) + "</div>");
            } else if (data.type === 'askForVideoCall') {
                if (_acctiveCallInfo.userPeerId != null) {
                    //user prica i ne moze da se javi
                    //posalji nazad obavestenje i tamo ga ispisi u popupAlert()
                    SendObjToActivePeer({
                        type: 'askForVideoCall',
                        message: 'busyCall'
                    }, c.peer);

                } else if (data.message === 'busyCall') {
                    //VideoCallButtonStart(); //put video button to state: start [call] 
                    callingFriend.restart();
                    popupAlert('Video call', 'User is currently busy.');
                    //VideoCallButtonStart();
                    //document.getElementsByClassName('video-mute')[0].disabled = true;
                    videoButtons.DisableAllButtons();
                    CloseLocalStream();
                    _acctiveCallInfo.RestartInfo();
                } else if (data.message === 'rejectedCall') {
                    //VideoCallButtonStart(); //put video button to state: start [call] 
                    callingFriend.restart();
                    popupAlert('Video call', 'Call was rejected by the user');
                    //VideoCallButtonStart();
                    //document.getElementsByClassName('video-mute')[0].disabled = true;
                    videoButtons.DisableAllButtons();
                    CloseLocalStream();
                    _acctiveCallInfo.RestartInfo();
                } else {
                    //pitaj user-a da li zeli da ima video call sa ovom osobom
                    let el = $('.person[data-peerid = ' + c.peer + ']');
                    ringtone.play();
                    popupCall(
                        'Video call!',
                        '<img class="popupImage" src="' + el.find("img").attr('src') + '"/> <span class="popupName">' + el.find(".name").text() + '</span>',
                        false);
                    popupBindButtons(
                        function (e) {
                            ringtone.restart();
                            if (!$("li.person[data-peerid='" + c.peer + "']")) {
                                RejectVideoCall(c.peer);
                                return;
                            }
                            PrepareForVideoCall();

                            $("li[data-tool='video']").trigger('mousedown');
                            let thisUser = $("li.person[data-peerid='" + c.peer + "']");
                            thisUser.trigger('mousedown');
                            videoButtons.NormalizeAllButtons();
                            videoButtons.ActivateButton(videoButtons.buttons.callButton);

                            //closePopup(e);
                            setTimeout(function () {
                                if (thisUser.find(".status-online").length != 0) {
                                    VideoCallUser(c.peer);
                                } else {
                                    _acctiveCallInfo.RestartInfo();
                                    CloseLocalStream();
                                    videoButtons.DisableAllButtons();
                                }
                            }, 2000);
                            _acctiveCallInfo.userPeerId = c.peer;
                            _acctiveCallInfo.type = 'video';
                            _acctiveCallInfo.muted = false;
                        },
                        function (e) {
                            ringtone.restart();
                            RejectVideoCall(c.peer);
                        }
                    );
                    /*
                                        $(document).off('click', '#cd-buttons-yes');
                                        $(document).on('click', '#cd-buttons-yes', function (e) {
                                            //document.getElementById("cd-buttons-yes").onclick = function () {
                                            //napravi poziv
                                            //prebaci user-a da gleda taj video call ako se javio
                                            ringtone.restart();
                                            if (!$("li.person[data-peerid='" + c.peer + "']")) {
                                                RejectVideoCall(c.peer);
                                                return;
                                            }
                                            PrepareForVideoCall();

                                            $("li[data-tool='video']").trigger('mousedown');
                                            let thisUser = $("li.person[data-peerid='" + c.peer + "']");
                                            thisUser.trigger('mousedown');

                                            //let btn = document.getElementsByClassName('video-call')[0];
                                            //btn.style.backgroundImage = "url('images/app/end-call.png')";
                                            //$(btn).attr('data-video-call', 'true').css('background-color', '#ff0000');

                                            //document.getElementsByClassName('video-mute')[0].disabled = false;


                                            videoButtons.NormalizeAllButtons();
                                            videoButtons.ActivateButton(videoButtons.buttons.callButton);

                                            closePopup(e);
                                            setTimeout(function () {
                                                if (thisUser.find(".status-online").length != 0) {
                                                    VideoCallUser(c.peer);
                                                } else {
                                                    _acctiveCallInfo.RestartInfo();
                                                    CloseLocalStream();
                                                    videoButtons.DisableAllButtons();

                                                    //document.getElementsByClassName('video-call')[0].disabled = true;
                                                    //document.getElementsByClassName('video-call')[0].style = '';
                                                    //document.getElementsByClassName('video-mute')[0].disabled = true;


                                                }
                                            }, 2000);
                                            _acctiveCallInfo.userPeerId = c.peer;
                                            _acctiveCallInfo.type = 'video';
                                            _acctiveCallInfo.muted = false;
                                        });
                                        $(document).off('click', '#cd-buttons-no');
                                        $(document).on('click', '#cd-buttons-no', function (e) {
                                            //document.getElementById("cd-buttons-no").onclick = function () {
                                            ringtone.restart();
                                            RejectVideoCall(c.peer);
                                            closePopup(e);
                                        });
                    */
                }
            } else if (data.type === 'askForVoiceCall') {
                if (_acctiveCallInfo.userPeerId != null) {
                    SendObjToActivePeer({
                        type: 'askForVoiceCall',
                        message: 'busyCall'
                    }, c.peer);

                } else if (data.message === 'busyCall') {
                    callingFriend.restart();
                    popupAlert('Voice call', 'User is currently busy.');
                    voiceButtons.DisableAllButtons();
                    CloseLocalStream();
                    _acctiveCallInfo.RestartInfo();
                } else if (data.message === 'rejectedCall') {
                    callingFriend.restart();
                    popupAlert('Voice call', 'Call was rejected by the user');
                    voiceButtons.DisableAllButtons();
                    CloseLocalStream();
                    _acctiveCallInfo.RestartInfo();
                } else {
                    let el = $('.person[data-peerid = ' + c.peer + ']');
                    ringtone.play();
                    popupCall(
                        'Voice call!',
                        '<img class="popupImage" src="' + el.find("img").attr('src') + '"/> <span class="popupName">' + el.find(".name").text() + '</span>',
                        false);

                    popupBindButtons(
                        function (e) {
                            ringtone.restart();
                            if (!$("li.person[data-peerid='" + c.peer + "']")) {
                                RejectVideoCall(c.peer);
                                return;
                            }
                            PrepareForVoiceCall();

                            $("li[data-tool='voice']").trigger('mousedown');
                            let thisUser = $("li.person[data-peerid='" + c.peer + "']");
                            thisUser.trigger('mousedown');

                            voiceButtons.NormalizeAllButtons();
                            voiceButtons.ActivateButton(voiceButtons.buttons.callButton);

                            setTimeout(function () {
                                if (thisUser.find(".status-online").length != 0) {
                                    VoiceCallUser(c.peer);
                                } else {
                                    _acctiveCallInfo.RestartInfo();
                                    CloseLocalStream();
                                    voiceButtons.DisableAllButtons();

                                }
                            }, 2000);
                            _acctiveCallInfo.userPeerId = c.peer;
                            _acctiveCallInfo.type = 'voice';
                            _acctiveCallInfo.muted = false;
                        },
                        function (e) {
                            ringtone.restart();
                            RejectVideoCall(c.peer);
                            _acctiveCallInfo.RestartInfo();
                        }
                    );

                    /*
                    $(document).off('click', '#cd-buttons-yes');
                    $(document).on('click', '#cd-buttons-yes', function (e) {
                        ringtone.restart();
                        if (!$("li.person[data-peerid='" + c.peer + "']")) {
                            RejectVideoCall(c.peer);
                            return;
                        }
                        PrepareForVoiceCall();

                        $("li[data-tool='voice']").trigger('mousedown');
                        let thisUser = $("li.person[data-peerid='" + c.peer + "']");
                        thisUser.trigger('mousedown');

                        voiceButtons.NormalizeAllButtons();
                        voiceButtons.ActivateButton(voiceButtons.buttons.callButton);

                        closePopup(e);
                        setTimeout(function () {
                            if (thisUser.find(".status-online").length != 0) {
                                VoiceCallUser(c.peer);
                            } else {
                                _acctiveCallInfo.RestartInfo();
                                CloseLocalStream();
                                voiceButtons.DisableAllButtons();

                            }
                        }, 2000);
                        _acctiveCallInfo.userPeerId = c.peer;
                        _acctiveCallInfo.type = 'voice';
                        _acctiveCallInfo.muted = false;
                    });
                    $(document).off('click', '#cd-buttons-no');
                    $(document).on('click', '#cd-buttons-no', function (e) {
                        ringtone.restart();
                        RejectVideoCall(c.peer);
                        closePopup(e);
                    });
*/






                }
            } else if (data.type === 'askForEditCall') {


                if (_activeEditInfo.userPeerId != null) {
                    SendObjToActivePeer({
                        type: 'askForEditCall',
                        message: 'busyCall'
                    }, c.peer);
                } else if (data.message === 'busyCall') {
                    callingFriend.restart();
                    popupAlert('Edit call', 'User is currently busy.');
                    _activeEditInfo.RestartInfo();

                    $('.edit-save').attr('disabled', true);
                    $('.edit-call').removeClass('active-call');
                } else if (data.message === 'rejectedCall') {
                    callingFriend.restart();
                    popupAlert('Edit call', 'Call was rejected by the user');
                    _activeEditInfo.ResetInfo();
                    $('.edit-save').attr('disabled', true);
                    $('.edit-call').removeClass('active-call');
                } else {


                    let el = $('.person[data-peerid = ' + c.peer + ']');
                    ringtone.play();
                    popupCall(
                        'Edit call!',
                        '<img class="popupImage" src="' + el.find("img").attr('src') + '"/> <span class="popupName">' + el.find(".name").text() + '</span>',
                        false);
                    popupBindButtons(
                        function (e) {
                            ringtone.restart();
                            if (!$("li.person[data-peerid='" + c.peer + "']")) {
                                _activeEditInfo.RestartInfo();
                                return;
                            }

                            $("li[data-tool='edit']").trigger('mousedown');
                            let thisUser = $("li.person[data-peerid='" + c.peer + "']");
                            thisUser.trigger('mousedown');

                            SendObjToActivePeer({
                                type: 'sendEditCode',
                                message: ''
                            }, c.peer);
                            //pozovi fju da napravis editor
                            _activeEditInfo.userPeerId = c.peer;
                        },
                        function (e) {
                            ringtone.restart();
                            SendObjToActivePeer({
                                type: 'askForEditCall',
                                message: 'rejectedCall'
                            }, c.peer);
                            _acctiveCallInfo.RestartInfo();
                        }
                    );
                    /*
                    $(document).off('click', '#cd-buttons-yes');
                    $(document).on('click', '#cd-buttons-yes', function (e) {
                        ringtone.restart();
                        if (!$("li.person[data-peerid='" + c.peer + "']")) {
                            _activeEditInfo.RestartInfo();
                            return;
                        }

                        $("li[data-tool='edit']").trigger('mousedown');
                        let thisUser = $("li.person[data-peerid='" + c.peer + "']");
                        thisUser.trigger('mousedown');

                        closePopup(e);

                        SendObjToActivePeer({
                            type: 'sendEditCode',
                            message: ''
                        }, c.peer);
                        //pozovi fju da napravis editor
                        _activeEditInfo.userPeerId = c.peer;

                    });
                    $(document).off('click', '#cd-buttons-no');
                    $(document).on('click', '#cd-buttons-no', function (e) {
                        ringtone.restart();
                        SendObjToActivePeer({
                            type: 'askForEditCall',
                            message: 'rejectedCall'
                        }, c.peer);
                        closePopup(e);
                    });

                    */


                }
            } else if (data.type === 'sendEditCode') {
                //uzmi podatke iz fajla i posalji ih ovom liku
                //
                callingFriend.restart();
                SendObjToActivePeer({
                    type: 'acceptEditCode',
                    message: _editFile
                }, c.peer);
                _activeEditInfo.userPeerId = c.peer;
                _editFile.languageDropList = $('#editorLanguage').attr('disabled', true).prop('selectedIndex');
                PrepareForEditCall(_editFile);
                $('.edit-save').attr('disabled', false);


            } else if (data.type === 'acceptEditCode') {
                // u postojeci fajl natrpati podatke 
                ringtone.restart();
                PrepareForEditCall(data.message);
                _activeEditInfo.userPeerId = c.peer;
                _editFile = data.message;
                editButton.attr('disabled', false);
                $('.edit-call').addClass('active-call');
                $('#editorLanguage').attr('disabled', true).prop('selectedIndex', _editFile.languageDropList);
            } else if (data.type === 'rejectCalls') {
                closePopup();
                ringtone.restart();
                if (data.message == 'edit') {
                    $('#code-mirror').css('z-index', -1).html('');
                    if (_activeEditInfo) {
                        _activeEditInfo.ResetInfo();
                    }

                    $('.edit-save').attr('disabled', true);
                    $('.edit-call').removeClass('active-call');
                } else if (data.message == 'video') {
                    //videti posle
                    console.log('stop video');
                } else if (data.message == 'voice') {
                    //videti posle
                    console.log('stio voice');
                }
            }

        });

        c.on('close', function () {
            let el = $('.person[data-peerid = ' + c.peer + ']').find(".status-online"); // data-person => c.metadata.message
            el.removeClass("status-online").addClass("status-offline");
            el.next().text("Offline");
            delete connectedPeers[c.peer];

            if (_activeEditInfo && _activeEditInfo.userPeerId == c.peer) {
                $('#code-mirror').css('z-index', -1).html('');
                if (_activeEditInfo) {
                    _activeEditInfo.ResetInfo();
                }

                $('.edit-save').attr('disabled', true);
                $('.edit-call').attr('disabled', true).removeClass('active-call');
            }
            if (_acctiveCallInfo && _acctiveCallInfo.userPeerId == c.peer) {
                if (_acctiveCallInfo.type == 'video') {
                    voiceButtons.DisableAllButtons();
                } else if (_acctiveCallInfo.type == 'voice') {
                    videoButtons.DisableAllButtons();
                }
                callingFriend.restart();
                DoVideoHangUp();
            }
        });

        //dodati jos video i voice ali to prvo videti kako se radi
        connectedPeers[c.peer] = 1;
    } else if (c.label === 'file') {
        c.on('data', function (data) {
            if (data.constructor === ArrayBuffer) {
                let dataBlob = new Blob([new Uint8Array(data)]);
                let url = window.URL.createObjectURL(dataBlob);
                //console.log(data);
                //console.log(dataBlob);
                $('.chat[data-chat = ' + c.peer + ']').append("<div class='bubble bubble-img you'><img src='" + url + "' width='300px'/></div>");
            }
        });
    } else if (c.label === 'friendRequest') {
        let $searched_people = $('.searched-people');
        let _data = c.metadata.message;

        let uiPeerID = c.peer;
        let imgurl = _data.imgUrl;

        if (imgurl) {
            imgurl = 'https://vmev.herokuapp.com/' + imgurl;
        } else {
            imgurl = 'images/app/default_user.png';
        }

        let peopleContactList = "<li class='search-person' data-person='" + _data._id + "' data-peerid='" + uiPeerID + "'>" +
            "<img src='" + imgurl + "'/>" +
            "<span class='name'>" + _data.firstName + " " + _data.lastName + "</span>" +
            "<div>" +
            "<span class='email'>" + _data.email + "</span>" +
            "</div>" +
            "<div class='addDropFriend'>" +
            "<button class='addFriend twoButtons' onclick='addNewFriend( " + JSON.stringify(_data) + " );'></button>" +
            "<button class='dropFriend' onclick='dropfriendrequest( " + JSON.stringify(_data) + " );'></button>" +
            "</div>" +
            "</li>";
        $searched_people.append(peopleContactList);
        messageNotificationSound.play();
        c.close();
        //CheckConnectionWithFriend(uiPeerID, _data._id);
    }
}
peer.on('call', function (call) {
    //treba videti kakav je call , da li je voice only or video
    // _stupid = c.options._payload.sdp.sdp.substr(50,50).indexOf('video');
    callingFriend.restart();
    if (call.options._payload.sdp.sdp.substr(50, 50).indexOf('video') != -1) {
        //video call
        AnswerVideoCall(call);
        _acctiveCallInfo.type = 'video';

    } else {
        //audio call
        //AnswerVoiceCall(call);
        _acctiveCallInfo.type = 'audio';
    }
    //console.log(call);
    _acctiveCallInfo.userPeerId = call.peer;
    _acctiveCallInfo.muted = false;
});

function AnswerVideoCall(call) { //step3
    EnableLocalStream();
    call.answer(window.localStream);
    //za svaki slucaj
    if (window.existingCall) {
        window.existingCall.close();
    }
    call.on('stream', function (stream) {
        $('#your-video').prop('src', URL.createObjectURL(stream));
    });
    window.existingCall = call;
    call.on('close', function () {
        console.log('close call');
        //sta kada se ugasi call
        //VideoCallButtonStart();
        CloseLocalStream();
        //document.getElementsByClassName('video-mute')[0].disabled = true;
        videoButtons.DisableAllButtons();
        if (chosenPerson == _acctiveCallInfo.userPeerId) {
            setTimeout(function () {
                if ($("li.person.active").find(".status-online").length != 0) {
                    videoButtons.NormalizeButton(videoButtons.buttons.callButton);
                }
            }, 500);
        }
        _acctiveCallInfo.RestartInfo();
    });
}

function PrepareForVideoCall() { //step1 // ovo pozivamo kada stisnemo dugme i cekamo poziv
    navigator.getUserMedia({
        audio: true,
        video: true
    }, function (stream) {
        $('#my-video').prop('src', URL.createObjectURL(stream));
        window.localStream = stream;
    }, function () {
        //ako dodje do errora 
        //popupAlert i ugasi poziv
        alert('error - mikrofon ili video ili oba ');
    });
}

function VideoCallUser(pid) {
    if (pid) {
        let call = peer.call(pid, window.localStream);
        AnswerVideoCall(call);
    }
}


function AnswerVoiceCall(call) {
    EnableLocalStream();
    call.answer(window.localStream);
    //za svaki slucaj
    if (window.existingCall) {
        window.existingCall.close();
    }
    call.on('stream', function (stream) {
        $('#your-audio').prop('src', URL.createObjectURL(stream));
    });
    window.existingCall = call;
    call.on('close', function () {
        CloseLocalStream();
        voiceButtons.DisableAllButtons();
        if (chosenPerson == _acctiveCallInfo.userPeerId) {
            setTimeout(function () {
                if ($("li.person.active").find(".status-online").length != 0) {
                    voiceButtons.NormalizeButton(voiceButtons.buttons.callButton);
                }
            }, 500);
        }
        _acctiveCallInfo.RestartInfo();
    });
} //step3
function PrepareForVoiceCall() {
    navigator.getUserMedia({
        audio: true,
        video: true
    }, function (stream) {
        //$('#my-video').prop('src', URL.createObjectURL(stream));
        window.localStream = stream;
    }, function () {
        //ako dodje do errora 
        //popupAlert i ugasi poziv
        alert();
        alert('error - mikrofon ili video ili oba ');
    });
} //step1
function VoiceCallUser(pid) {
    if (pid) {
        let call = peer.call(pid, window.localStream);
        AnswerVoiceCall(call);
        SetVideoStream(false);
    }
}

function CloseCallWithUser() {
    if (window.existingCall) {
        window.existingCall.close();
        //testiranje
        window.existingCall = null;
    }
    CloseLocalStream();
    //_acctiveCallInfo.RestartInfo();
    //videoButtons.DisableAllButtons();
}

function SetVideoStream(t) {
    t = t || false;
    window.localStream.getVideoTracks()[0].enabled = t;
}

function SetVoiceStream(t) {
    t = t || false;
    window.localStream.getAudioTracks()[0].enabled = t;
}

function CloseLocalStream(t = false) {
    //window.localStream.getVideoTracks()[0].stop();
    //window.localStream.getAudioTracks()[0].stop();
    window.localStream.getVideoTracks()[0].enabled = t;
    window.localStream.getAudioTracks()[0].enabled = t;
}

function EnableLocalStream() {
    CloseLocalStream(true);
}
// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function (e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};

$("#sendMessage").on("click", function () {
    SendMessageOnEnter();
});

$("#MessageTextField").keypress(function (e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
        SendMessageOnEnter();
    }
});

/*
    let pid = $("li.person.active").attr("data-peerid");
    let conn = peer.connections[pid][0];
    conn.send({
        type: 'askForVideoCall',
        message: 'rejectedCall'
    });
    */
function RejectVideoCall(peer) { //RejectVideoCall
    SendObjToActivePeer({
        type: "askForVideoCall",
        message: "rejectedCall"
    }, peer);
}

function SendMessageOnEnter() {
    //pitati da li je msg prazan ili ima space/tab nista ne slati ovo ispod
    let msg = $("#MessageTextField").val();
    if ((/^[\s\t]+$/).test(msg) || msg.length == 0) {
        return;
    }
    if ($("li.person.active").find(".status-online").length == 0) {
        return;
    }
    /*
    let pid = $("li.person.active").attr("data-peerid");
    let conn = peer.connections[pid][0];
    conn.send({
        type: 'chat',
        message: msg
    });
    */
    let pid = SendObjToActivePeer({
        type: 'chat',
        message: msg
    });

    $('.chat[data-chat = ' + pid + ']').append("<div class='bubble me'>" + myEmojiRenderer(msg) + "</div>");
    $("#MessageTextField").val("").focus();
    ScrollToTopMessage();
    return;
}

function clickAttachFile() {
    //provera da li je online user
    if ($("li.person.active").find(".status-online").length == 0) {
        return;
    }
    $("#attach-file").val("").click();
}
$("#attach-file").change(function (e) {
    //odradi transfer fajla
    let file = $("#attach-file")[0].files[0];
    if (ValidateInputFile(file.type))
        return;

    /*
    let pid = $("li.person.active").attr("data-peerid");
    let conn = peer.connections[pid][1];
    conn.send(file);
    */
    let pid = SendObjToActivePeer(file, null, 1);
    $('.chat[data-chat = ' + pid + ']').append("<div class='bubble bubble-img me'><img src='" + file.path + "' width='300px'/></div>");
});

$(document).ready(function () {
    var box = $('.message-container');
    if (box !== undefined) {
        box.on('dragenter', doNothing);
        box.on('dragover', doNothing);
        box.on('drop', function (e) {
            e.originalEvent.preventDefault();
            if ($("li.person.active").find(".status-online").length == 0) {
                e.stopPropagation();
                return;
            }
            var file = e.originalEvent.dataTransfer.files[0];
            var pid = $("li.person.active").attr("data-peerid");
            var c = peer.connections[pid][1];
            if (c.label === 'file') {
                if (file.type === undefined) {
                    alert('Reci goranu da pogleda tvoj objekat!');
                    console.log(file);
                    return;
                }
                if (ValidateInputFile(file.type)) {
                    propAlert('File selection', 'Please select image in case you want to send it to friend.');
                    return;
                }
                c.send(file);
                $('.chat[data-chat = ' + pid + ']').append("<div class='bubble bubble-img me'><img src='" + file.path + "' width='300px'/></div>");
            }
        });

        function doNothing(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

});

function ValidateInputFile(extension) {
    if (!(extension == 'image/jpg' || extension == 'image/jpeg' || extension == 'image/png' || extension == 'image/gif')) {
        return true;
    }
    return false;
}

function videoMuteMyself(btn) {
    //alert('work');
    if (window.localStream.getAudioTracks()[0].enabled) {
        _acctiveCallInfo.myVoiceMuted = true;
        SetVoiceStream(false);
        videoButtons.ActivateButton(videoButtons.buttons.muteMeButton);
    } else {
        _acctiveCallInfo.myVoiceMuted = false;
        SetVoiceStream(true);
        videoButtons.NormalizeButton(videoButtons.buttons.muteMeButton);
    }
}

function videoMute(btn) {
    if ($("#your-video").attr('muted') == 'false') {
        $("#your-video").attr('muted', 'true');
        //btn.style.backgroundImage = "url('images/app/muted.png')";
        videoButtons.ActivateButton(videoButtons.buttons.muteYouButton);
        _acctiveCallInfo.muted = true;
    } else {
        $("#your-video").attr('muted', 'false');
        //btn.style.backgroundImage = "url('images/app/speaker.png')";
        videoButtons.NormalizeButton(videoButtons.buttons.muteYouButton);
        _acctiveCallInfo.muted = false;
    }
}

function videoCall(btn) {
    if ($(btn).attr('data-video-call') == 'false') {
        AskForVideoCall();
        PrepareForVideoCall();
        callingFriend.play();
        setTimeout(function () {
            if (!_acctiveCallInfo.userPeerId) {
                callingFriend.restart();
                //odbi poziv
                videoButtons.DisableAllButtons();
                DoVideoHangUp();
            }
            //}, 55000);
        }, 10000);
        /*
        btn.style.backgroundImage = "url('images/app/end-call.png')";
        $(btn).attr('data-video-call', 'true').css('background-color', '#ff0000');
        document.getElementsByClassName('video-mute')[0].disabled = false;
        */
        videoButtons.ActivateButton(videoButtons.buttons.callButton);
        videoButtons.NormalizeButton(videoButtons.buttons.muteYouButton);
        videoButtons.NormalizeButton(videoButtons.buttons.muteMeButton);

    } else {
        if (window.existingCall) {
            DoVideoHangUp();
        }
        //VideoCallButtonStart(btn); //put video button to state: start [call] 
        //document.getElementsByClassName('video-mute')[0].disabled = true;
        //videoButtons.DisableButton(videoButtons.buttons.muteYouButton);
    }
}

function editCall(btn) {
    if (_activeEditInfo.userPeerId == null) {
        AskForEditCall();
        //PrepareForEditCall();
        callingFriend.play();
    } else {
        //reject call
        //zatvori ovo sranje 
        //prikazi mu ono pre
        SendObjToActivePeer({
            type: "rejectCalls",
            message: "edit"
        }, _activeEditInfo.userPeerId);
        _activeEditInfo.ResetInfo();
        $('.edit-call').removeClass('active-call');
        $('.edit-save').attr('disabled', true);
        $('#editorLanguage').attr('disabled', false).prop('selectedIndex', 0);
        $('#code-mirror').css('z-index', -1).html('');

    }
}

function AskForEditCall() {
    $('.edit-call').addClass('active-call');
    SendObjToActivePeer({
        type: 'askForEditCall',
        message: ''
    });
    //_activeEditInfo.userPeerId = $("li.person.active").attr("data-peerid");
    //posalji podatke u fajlu
}

function PrepareForEditCall(data) {
    //otvori fajl itd 
    let cm = document.getElementById("code-mirror");
    cm.style.zIndex = 5;
    cm.innerHTML = '<iframe id="iframeEdit" src="edit.html" ></iframe>';
    $editor = $("#iframeEdit")[0].contentWindow;
    //$editor.PrepareEditorCM(2);
    //postavi podatke i ta sranja 
}

function SaveEditorData() {
    let data = {
        filePath: _activeEditInfo.filePath,
        fileData: $editor.GetDataFromEditor()
    };
    if (data.filePath != null && data.fileData != null) {
        UseIcpRenderer('SaveFile', data);
    }
}



function voiceMuteMyself(btn) {
    if (window.localStream.getAudioTracks()[0].enabled) {
        _acctiveCallInfo.myVoiceMuted = true;
        SetVoiceStream(false);
        voiceButtons.ActivateButton(voiceButtons.buttons.muteMeButton);
    } else {
        _acctiveCallInfo.myVoiceMuted = false;
        SetVoiceStream(true);
        voiceButtons.NormalizeButton(voiceButtons.buttons.muteMeButton);
    }
}

function voiceMute(btn) {
    let yourAudio = $("#your-audio");
    if (yourAudio.attr('muted') == 'false') {
        yourAudio.attr('muted', 'true');
        voiceButtons.ActivateButton(voiceButtons.buttons.muteYouButton);
        _acctiveCallInfo.muted = true;
    } else {
        yourAudio.attr('muted', 'false');
        voiceButtons.NormalizeButton(voiceButtons.buttons.muteYouButton);
        _acctiveCallInfo.muted = false;
    }
}

function voiceCall(btn) {
    if ($(btn).attr('data-voice-call') == 'false') {
        AskForVoiceCall();
        PrepareForVoiceCall();
        callingFriend.play();
        setTimeout(function () {
            if (!_acctiveCallInfo.userPeerId) {
                callingFriend.restart();
                //odbi poziv
                voiceButtons.DisableAllButtons();
                DoVideoHangUp();
            }
        }, 55000);
        //kad pozove zabraniti video da se salje tj enable
        //SetVideoStream(false);

        voiceButtons.ActivateButton(voiceButtons.buttons.callButton);
        voiceButtons.NormalizeButton(voiceButtons.buttons.muteYouButton);
        voiceButtons.NormalizeButton(voiceButtons.buttons.muteMeButton);

    } else {
        if (window.existingCall) {
            DoVideoHangUp();
        }
    }
}

/*
function VideoCallButtonStart(btn) {
    btn = btn || document.getElementsByClassName('video-call')[0];
    btn.style.backgroundImage = "url('images/app/start-call.png')";
    $(btn).attr('data-video-call', 'false').css('background-color', '#00b0ff');
}*/

function AskForVideoCall() {
    /*let pid = $("li.person.active").attr("data-peerid");
    let conn = peer.connections[pid][0];
    conn.send({
        type: 'askForVideoCall',
        message: ''
    });
    */
    SendObjToActivePeer({
        type: 'askForVideoCall',
        message: ''
    });
}

function AskForVoiceCall() {
    SendObjToActivePeer({
        type: 'askForVoiceCall',
        message: ''
    });
}

function DoVideoHangUp() {
    //_acctiveCallInfo.RestartInfo();
    CloseCallWithUser();
    //najmanje ovo gore treba da se obavi 
    // treba videti sa peerjs-om kako se prekida video call
}


function isActiveUserOnline() {
    if ($('.left .person.active').find('.status-online').length) {
        return true;
    }
    return false;
}

function isVideoCall() {
    if ($(".video-call").attr('data-video-call') == 'false') {
        return false;
    }
    return true;
}

function isVoiceCall() {
    if ($(".voice-call").attr('data-voice-call') == 'false') { // <--
        return false;
    }
    return true;
}
//ui namesti da dugme kada se promeni aktivan user kontrolise da li moze ili ne da se zove
//ako nekog zoves onda drugi ne mogu da te zovu itd 




// ucitati poruke prethodnih ljudi



function SendObjToActivePeer(__o, __pid, __c) {
    __pid = __pid || $("li.person.active").attr("data-peerid");
    __c = __c || 0;
    let conn = peer.connections[__pid][__c];
    conn.send(__o);
    return __pid;
}
/*
function SendNewFriendRequest(data) {
    let c = peer.connect(requestedPeer, {
        label: 'loggedin',
        serialization: 'json',
        metadata: {
            message: '' + _myID
        }
    });
}
*/
function CloseConnectionWithDeletedFriend(peerid) {
    if (connectedPeers[peerid]) {
        //unisti konekciju sa userom
        peer.connections[peerid].forEach(function (el) {
            el.close();
        });
    }
}