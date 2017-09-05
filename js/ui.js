window.addEventListener("dragover", function (e) {
	e = e || event;
	e.preventDefault();
}, false);
window.addEventListener("drop", function (e) {
	e = e || event;
	e.preventDefault();
}, false);

//
// init starting tool -> message 
//
$('.features .tools li[data-tool=message]').addClass('tool-active');
var tool = "message";
var chosenPerson = null;
//
// this change class of tool meni
//
//$('.features .tools li').mousedown(function(){
$(document).on('mousedown', '.features .tools li', function () {
	//
	// if clicked element have class -> stop action
	//
	if ($(this).hasClass('tool-active')) {
		return false;
	} else {
		//
		// getting new value for tool -> from clicked element
		//
		tool = $(this).attr('data-tool');

		//
		//	removing all classes from tool 
		//
		$('.features .tools li.tool-active').removeClass('tool-active');

		//
		// adding class to clicked element
		//
		$(this).addClass('tool-active');
		//
		// remove all classes named a-r-c for first layer only
		//
		$('.container-fluid .right ').children().removeClass('active-right-container');
		//
		// add class to clicked element
		//
		$('.container-fluid .right .' + tool + '-container').addClass('active-right-container');
		//
		// calling render function to render stuff for person
		//
		render();
	}
});

//
// This is for people selection
//
//$('.left .person').mousedown(function () {
$(document).on('mousedown', '.left .person', function () {

	if (!$(".container-fluid .right .choose-container").hasClass('hide-default')) {
		$(".container-fluid .right .choose-container").addClass('hide-default');
	}
	//
	// if clicked person have class active -> stop action
	//
	if (!personExist()) {
		//
		// remove all classes named a-r-c for first layer only
		//
		$('.container-fluid .right ').children().removeClass('active-right-container');
		//
		// add class to clicked element
		//
		$('.container-fluid .right .' + tool + '-container').addClass('active-right-container');

	}
	if ($(this).hasClass('active')) {
		return false;
	} else {
		//
		// remove all person tags
		//
		$('.left .person.active').removeClass('active');
		$(this).addClass('active');
		chosenPerson = $(this).attr('data-peerid');
		render(this);
	}
});

//
// this function choose what to render for user
//
function render(obj) {
	if (personExist()) {
		if (tool == "voice") {
			voiceRender();
		} else if (tool == "message") {
			messageRender(obj);
		} else if (tool == "edit") {
			editRender();
		} else if (tool == "video") {
			videoRender();
		}
	}
}

function ScrollToTopMessage() {
	//
	// scrolling messages to bottom
	//
	if ($(".active-chat").length > 0) {
		let height = $(".active-chat")[0].scrollHeight;
		if (height) {
			$(".active-chat").scrollTop(height);
		}
	}
}


function voiceRender() {
	//console.log('voice');
	if (!isVoiceCall()) {
		//nema voice call-a
		if (isActiveUserOnline()) {
			voiceButtons.NormalizeButton(voiceButtons.buttons.callButton);
		} else {
			voiceButtons.DisableAllButtons();
		}

		//
		//postavi sliku selektovanog usera
		let img = $('.left .person.active').find('img').attr('src');
		//$('.voice-img img').attr('src', img);
		$('.voice-img img').attr('src', img);
		document.styleSheets[4].cssRules[0].style.visibility = 'hidden';
	} else {
		//ima voice call-a
		//baci alert da se prvo mora prekinuti postojeci razgovor 
		//dodati ikonicu pored coveka s kojim pricas 
		// ne mozes pricati ako imas video call 
		// ne mozes pricati ako pricas
		document.styleSheets[4].cssRules[0].style.visibility = 'visible';

		if (chosenPerson == _acctiveCallInfo.userPeerId && (_acctiveCallInfo.type == 'voice' || _acctiveCallInfo.type == 'audio')) {
			voiceButtons.ActivateButton(voiceButtons.buttons.callButton);
			let yourAudio = document.getElementById('your-audio');
			yourAudio.muted = _acctiveCallInfo.muted;
			if (_acctiveCallInfo.muted) {
				voiceButtons.ActivateButton(voiceButtons.buttons.muteYouButton);
			} else {
				voiceButtons.NormalizeButton(voiceButtons.buttons.muteYouButton);
			}

			if (_acctiveCallInfo.myVoiceMuted) {
				voiceButtons.ActivateButton(voiceButtons.buttons.muteMeButton);
			} else {
				voiceButtons.NormalizeButton(voiceButtons.buttons.muteMeButton);
			}
		} else {
			voiceButtons.DisableAllButtons();
			popupAlert('Voice call', 'In case you want to voice call with this friend, you need to end up existing call.');
		}

	}
}

function messageRender() {
	//
	// Remove class from existing elements and adding class to clicked element
	//
	$('.chat.active-chat').removeClass('active-chat');
	$('.chat[data-chat = ' + chosenPerson + ']').addClass('active-chat');
	let uiPerson = $("li.person[data-peerid =" + chosenPerson + "] .single-person-notification");
	if (uiPerson.find('span')) {
		uiPerson.html('');
	}

	ScrollToTopMessage();

	if ($(".right .active-chat .bubble:last-child").attr("style") != undefined) {
		//
		//	this is for performanse
		//	if he got duration dont calc it again
		//
		// 	and automatic if message is added it will add animation 
		//
		return false;
	}

	//
	// adding animation to messages 
	//
	var number = $('.right .active-chat').children().length - 1;

	//
	// this is for going backword and stop adding animation after 20 elements
	//
	var j = 20;
	for (var i = number; i >= 0; i--) {
		if (j-- == 0) return false;
		var a = $(".right .active-chat .bubble")[i];
		$(a).css({
			'animation-duration': 0.1 * (4 + number - i) + 's'
		});

	}
}

function editRender() {
	//ovo se desava samo kada pozivamo nekog
	if (_activeEditInfo.userPeerId) {
		//imamo edit
		//pitaj da li smo kod tog user-a
		//baci alert ako nismo

	} else {
		if (!_editFile.haveItem) {
			editButton.attr("disabled", true);
			return;
		}
		if (isActiveUserOnline()) {
			editButton.attr("disabled", false);
		} else {
			editButton.attr("disabled", true);
		}
	}
}

function videoRender() {
	if (!isVideoCall()) {
		//nema video call-a
		if (isActiveUserOnline()) {
			//document.getElementsByClassName('video-call')[0].disabled = false;
			videoButtons.NormalizeButton(videoButtons.buttons.callButton);
		} else {
			//document.getElementsByClassName('video-call')[0].disabled = true;
			videoButtons.DisableAllButtons();
		}
	} else {
		//proveriti da li pricam sa tom osobom
		if (chosenPerson == _acctiveCallInfo.userPeerId && _acctiveCallInfo.type == 'video') {
			videoButtons.ActivateButton(videoButtons.buttons.callButton);
			let yourVid = document.getElementById('your-video');
			yourVid.muted = _acctiveCallInfo.muted;
			if (_acctiveCallInfo.muted) {
				videoButtons.ActivateButton(videoButtons.buttons.muteYouButton);
			} else {
				videoButtons.NormalizeButton(videoButtons.buttons.muteYouButton);
			}

			if (_acctiveCallInfo.myVoiceMuted) {
				videoButtons.ActivateButton(videoButtons.buttons.muteMeButton);
			} else {
				videoButtons.NormalizeButton(videoButtons.buttons.muteMeButton);
			}
		} else {
			videoButtons.DisableAllButtons();
			popupAlert('Video call', 'In case you want to video call with this friend, you need to end up existing call.');
		}
	}
}

function personExist() {
	if (chosenPerson == null) {
		return false;
	}
	return true;
}

//
//	Starting application
//
render();

var $searchElement = $('#searchFriends');
var $people = $(".people");

function SearchOnChange(el) {
	let searchText = el.value.toUpperCase();
	//for petljom kroz ljude i onda dodaj oduzmi klasu i tako
	$people.find('li.person').each(function (i, li) {
		if (li.getElementsByClassName('name')[0].innerHTML.toUpperCase().indexOf(searchText) > -1 || searchText == '') {
			li.style.display = 'block';
		} else {
			li.style.display = 'none';
		}
	});
}

function SearchForNewFriends() {
	//na bekendu uradi da vraca samo 3 coveka 

	let txt = $searchElement.val();
	let $searched_people = $('.searched-people');
	$searched_people.html('');
	if (!(/^[\S\s]{2,254}$/).test(txt)) {
		$people.css({
			height: 'calc( 100% - 54px)'
		});
		return;
	}
	let $loadingPeople = $('#loading-people');
	let searchData = {
		search: txt
	};
	$.ajax({
		url: "https://vmev.herokuapp.com/searchfriend",
		type: "post",
		data: JSON.stringify(searchData),
		dataType: "json",
		contentType: "application/json",
		success: function (data) {
			data.server.forEach(function (element) {

				let uiPeerID = element.peerID || element._id;
				let imgurl = element.imgUrl;
				let addRemoveButton = "";

				if (!imgurl) {
					imgurl = 'images/app/default_user.png';
				}

				if (FriendsData.length > 0) {
					let add = true;
					for (let i = 0; i < FriendsData.length; i++) {
						if (FriendsData[i]._id == element._id) {
							addRemoveButton = "<button class='removeFriend' onclick='removeNewFriend( " + JSON.stringify(element) + " );'></button>";
							add = false;
							break;
						}
					}
					if (add) {
						if (element._id != _ThisUserID) {
							addRemoveButton = "<button class='addFriend' onclick='sendfriendrequest(" + JSON.stringify(element) + ");'></button>";
						}
					}
				} else {
					if (element._id != _ThisUserID) {
						addRemoveButton = "<button class='addFriend' onclick='sendfriendrequest(" + JSON.stringify(element) + ");'></button>";
					}
				}

				let peopleContactList = "<li class='search-person' data-person='" + element._id + "' data-peerid='" + uiPeerID + "'>" +
					"<img src='" + imgurl + "'/>" +
					"<span class='name'>" + element.firstName + " " + element.lastName + "</span>" +
					"<div>" + //status-online za kod ispod
					"<span class='email'>" + element.email + "</span>" +
					"</div>" +
					addRemoveButton +
					"</li>";
				$searched_people.append(peopleContactList);
			}, this);
			let newHeight = 54 + 72 * (1 + (data.server.length >= 3 ? 3 : data.server.length));
			$people.css({
				height: 'calc( 100% - ' + newHeight + 'px)'
			});
			//odradi kalkulaciju
		},
		error: function (err) {
			if (err.status == 404) {
				//uradi da nema user-a
				//sakri ponovo onaj ul
				/*$searched_people.css({
					display: 'none'
				});*/
			} else {
				popupAlert('Search friends online ', err);
			}
		},
		beforeSend: function () {
			//upaliti animaciju
			$loadingPeople.css('display', 'block');
			$people.append("<li class='spacer'></li>");
		},
		complete: function () {
			//ugasiti animaciju
			$loadingPeople.css('display', 'none');
		}

	});
}

function ButtonSection(_type, _parent) {
	let type = _type,
		parentNode = _parent,
		muteMyselfButton, muteYourSoundButton, CallButton;

	let _buttons = {
		muteMeButton: 'me',
		muteYouButton: 'you',
		callButton: 'call'
	};

	function SetButtons() {
		//mozda treba [0]
		muteMyselfButton = $(parentNode + ' .mute-myself')[0];
		muteYourSoundButton = $(parentNode + ' .' + type + '-mute')[0];
		CallButton = $(parentNode + ' .' + type + '-call')[0];
	}

	function DisableAllButtons(t = true) {
		DisableButton(_buttons.callButton, t);
		DisableButton(_buttons.muteMeButton, t);
		DisableButton(_buttons.muteYouButton, t);
	}

	function NormalizeAllButtons() {
		NormalizeButton(_buttons.callButton);
		NormalizeButton(_buttons.muteMeButton);
		NormalizeButton(_buttons.muteYouButton);
	}

	function DisableButton(btn, t = true) {
		switch (btn) {
			case _buttons.muteMeButton:
				muteMyselfButton.disabled = t;
				break;
			case _buttons.muteYouButton:
				muteYourSoundButton.disabled = t;
				break;
			case _buttons.callButton:
				CallButton.disabled = t;
				break;

			default:
				alert('Execute Error');
				break;
		}
	}

	function NormalizeButton(btn) {
		switch (btn) {
			case _buttons.muteMeButton:
				muteMyselfButton.disabled = false;
				muteMyselfButton.style.backgroundImage = "url('images/app/voice.svg')";
				break;
			case _buttons.muteYouButton:
				muteYourSoundButton.disabled = false;
				muteYourSoundButton.style.backgroundImage = "url('images/app/sound-on.svg')";
				break;
			case _buttons.callButton:
				CallButton.disabled = false;
				CallButton.style.backgroundImage = "url('images/app/call-answer.svg')";
				CallButton.setAttribute('data-video-call', 'false');
				CallButton.setAttribute('data-voice-call', 'false');
				//CallButton.className.classList.remove('active-call');
				CallButton.classList.remove('active-call');
				break;

			default:
				alert('Execute Error');
				break;
		}
	}

	function ActivateButton(btn) {
		switch (btn) {
			case _buttons.muteMeButton:
				muteMyselfButton.disabled = false;
				muteMyselfButton.style.backgroundImage = "url('images/app/mute-voice.svg')";
				break;
			case _buttons.muteYouButton:
				muteYourSoundButton.disabled = false;
				muteYourSoundButton.style.backgroundImage = "url('images/app/sound-off.svg')";
				break;
			case _buttons.callButton:
				CallButton.disabled = false;
				CallButton.style.backgroundImage = "url('images/app/call-answer.svg')";
				//CallButton.className.classList.add('active-call');
				CallButton.classList.add('active-call');
				CallButton.setAttribute('data-video-call', 'true');
				CallButton.setAttribute('data-voice-call', 'true');
				break;

			default:
				alert('Execute Error');
				break;
		}
	}

	SetButtons();

	return {
		buttons: _buttons,
		//functions
		DisableAllButtons: DisableAllButtons,
		NormalizeAllButtons: NormalizeAllButtons,
		DisableButton: DisableButton,
		NormalizeButton: NormalizeButton,
		ActivateButton: ActivateButton
	}

}

var voiceButtons = ButtonSection('voice', '.voice-settings'),
	videoButtons = ButtonSection('video', '.video-settings');
var editButton = $(".edit-call");

function closeDragDropFrame() {
	$('#UploadCropImage').remove();
}

function UploadProfilePicture(img) {
	let formdata = new FormData();
	formdata.append("_id", GetThisUserId());
	formdata.append("avatar", img);

	let $iframeUploadCrop = $("#iframeUploadCrop")[0].contentWindow;
	$.ajax({
		url: "https://vmev.herokuapp.com/uploadprofilepicture",
		//url: "http://localhost:443/uploadprofilepicture",
		type: "post",
		data: formdata,
		contentType: false,
		processData: false,
		success: function (data) {
			$iframeUploadCrop.uploadCropSuccess();
		},
		error: function (err) {
			console.log(err);
			popupAlert('Ovo je error za upload profilne slike', err.responseJSON.error);
			closeDragDropFrame();
		},
		beforeSend: function () {
			$iframeUploadCrop.addLoader();
		}
	});
}

var $editor = null;

var fileselect = document.getElementById("EditFile");
var _editFile = {
	haveItem: false,
	file: null,
	language: null,
	RestartFile: function () {
		this.haveItem = false;
		let tick = fileselect.parentNode.getElementsByClassName('tick')[0];
		tick.style.opacity = 0;
		this.file = null;
		this.language = null;
	},
	InsertFile: function (f) {
		let reader = new FileReader();
		reader.onload = function (e) {
			//callback(e.target.result, file.name);
			_editFile.file = e.target.result;
			_editFile.language = f.type.split('/').pop();
			_editFile.type = f.type;
			_editFile.haveItem = true;
		}
		reader.readAsText(f);
	}
};

fileselect.addEventListener("change", FileSelectHandler, false);
fileselect.addEventListener("dragover", FileDragHover, false);
fileselect.addEventListener("dragleave", FileDragHover, false);
fileselect.addEventListener("drop", FileSelectHandler, false);


function FileDragHover(e) {
	e.stopPropagation();
	e.preventDefault();
}

function FileSelectHandler(e) {
	_activeEditInfo.filePath = null;

	let tick = fileselect.parentNode.getElementsByClassName('tick')[0];
	tick.style.opacity = 0;
	editButton.attr("disabled", true);
	if (e.target.files.length == 0)
		return;
	FileDragHover(e);
	var file = e.target.files[0] || e.dataTransfer.files[0];
	if (!ValidateEditInputFileExtension(file.type))
		return;
	tick.style.opacity = 1;
	//ako je user aktivan onda omoguciti poziv
	if (isActiveUserOnline()) {
		editButton.attr("disabled", false);
	}
	_editFile.InsertFile(file);

	if (!_activeEditInfo.userPeerId) {
		_activeEditInfo.filePath = file.path || null;
	}
}

function ValidateEditInputFileExtension(extension) {

	return true;
}

function InitEditor(fn) {
	if (_activeEditInfo.dataForEditor) {
		fn(_activeEditInfo.dataForEditor);
	} else {
		fn(_editFile);
	}
}

function GetLanguageFromList() {
	let $listData = $('#editorLanguage').val();
	return {
		type: $listData.split('|')[0],
		language: $listData.split('|')[1]
	}
}

function LanguageListChange() {
	if ($editor && _activeEditInfo.userPeerId) {
		$editor.SetLanguageForEditor();
	}
}

function ReplaceProfilePictureWithUploadedOne(img) {
	$('#userProfileImg').attr('src', img);
}

function addNewFriend(data) {
	let addData = {
		requestFrom: data._id,
		_id: _ThisUserID,
		requestTo: _ThisUserID
	};
	AjaxSend(
		'addfriend',
		addData,
		function (_data) {
			let imgurl = data.imgUrl;
			if (!imgurl) {
				imgurl = 'images/app/default_user.png';
			}
			let uiPeerID = data.peerID || data._id;
			let newUser = "<li class='person' data-person='" + data._id + "' data-peerid='" + uiPeerID + "'>" +
				"<img src='" + imgurl + "'/>" +
				"<span class='name'>" + data.firstName + " " + data.lastName + "</span>" +
				"<div>" +
				"<span class='login-status status-offline'></span>" +
				"<span class='status-text'>Offline</span>" +
				"</div>" +
				"<div class='single-person-notification'></div>" +
				"</li>";

			let peopleMessages = "<div class='chat' data-chat='" + uiPeerID + "'></div>";


			$(".people").append(newUser);
			$(".message-container").prepend(peopleMessages);
			$('.searched-people li[data-person =' + data._id + ']').remove();
			// videti da li je online 
			FriendsData.push({
				_id: data._id,
				peerID: uiPeerID
			});
			CheckConnectionWithFriend(uiPeerID, data._id);
		},
		function (err) {
			//error
			popupAlert('Add friend', "We couldn't add friend.");
		}
	);
}

function removeNewFriend(data) {
	let removeData = {
		_id: _ThisUserID,
		friendID: data._id
	};

	AjaxSend(
		'removefriend',
		removeData,
		function (_data) {
			//success
			$('.searched-people li[data-person =' + data._id + ']').remove();
			$('.people li[data-person =' + data._id + ']').remove();

			for (let i = 0; i < FriendsData.length; i++) {
				if (FriendsData[i]._id == data._id) {
					FriendsData.splice(i, 1); //slice
					break;
				}
			}
			CloseConnectionWithDeletedFriend(data.peerID);
		},
		function (err) {
			//error
			popupAlert('Remove friend', "We couldn't remove friend.");
		}
	);
}

function sendfriendrequest(data) {
	let sendData = {
		requestFrom: _ThisUserID,
		requestTo: data._id
	};

	AjaxSend(
		'sendfriendrequest',
		sendData,
		function (_data) {
			//success
			//poslati peer-om konekciju kao ali da bude friend request
			popupAlert('Send friend request', "You have sent friend request successfully.");
			SendNotificationForFriendRequest(_data.returnData.peerID);
		},
		function (err) {
			//error
			popupAlert('Send friend request', "We couldn't send friend request.");
		}
	);
}

function dropfriendrequest(data) {
	let dropData = {
		requestFrom: data._id,
		requestTo: _ThisUserID
	};
	AjaxSend(
		'dropfriendrequest',
		dropData,
		function (data) {
			//success
			//izbrisati ga iz te nove liste
			$('.searched-people li[data-person =' + dropData.requestFrom + ']').remove();
		},
		function (err) {
			//error
			popupAlert('Remove friend request', "We couldn't remove friend request.");
		}
	);
}

function AjaxSend(lastUrlPart, dataObject, fnSuccess, fnError, fnBeforeSend, fnComplete) {
	$.ajax({
		url: "https://vmev.herokuapp.com/" + lastUrlPart,
		type: "post",
		data: JSON.stringify(dataObject),
		dataType: "json",
		contentType: "application/json",
		success: function (data) {
			if (fnSuccess) {
				fnSuccess(data);
			}
		},
		error: function (err) {
			if (fnError) {
				fnError(err);
			}
		},
		beforeSend: function () {
			if (fnBeforeSend) {
				fnBeforeSend();
			}
		},
		complete: function () {
			if (fnComplete) {
				fnComplete();
			}
		}
	});
}

$('.tool-settings img').on('click', function () {
	popupProfileSettings();
});

function sendNewProfileData() {
	//changePassword - url
	let sendData = {
		_id: _ThisUserID,
		old_pass: $('#oldPassword').val(),
		password: $('#newPassword').val(),
		repass: $('#confirmPassword').val()
	};
	if ((/^\S{8,128}$/).test(sendData.old_pass) && (sendData.password == sendData.repass) && (/^\S{8,128}$/).test(sendData.password)) {
		// posalji ga serveru 
		AjaxSend(
			'changePassword',
			sendData,
			function (data) {
				$('.cd-form h3').css({
					'visibilty': 'visible',
					'color': 'green'
				}).text('Success');
			},
			function (err) {
				$('.cd-form h3').css({
					'visibilty': 'visible',
					'color': 'red'
				}).text('Old password is not correct');
			}
		);
	} else {
		$('.cd-form h3').css({
			'visibilty': 'visible',
			'color': 'red'
		}).text('Your inputs are not valid');
	}
}

function GoToEditUser() {
	$("li[data-tool='edit']").trigger('mousedown');
	GoToUser(_activeEditInfo.userPeerId);
}

function GoToVoiceUser() {
	$("li[data-tool='voice']").trigger('mousedown');
	GoToUser(_acctiveCallInfo.userPeerId);
}

function GoToVideoUser() {
	$("li[data-tool='video']").trigger('mousedown');
	GoToUser(_acctiveCallInfo.userPeerId);
}

function GoToUser(peer) {
	let thisUser = $("li.person[data-peerid='" + peer + "']");
	if (thisUser) {
		thisUser.trigger('mousedown');
	}
}