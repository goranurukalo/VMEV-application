const {
	ipcRenderer
} = require('electron');
var _ThisUserData = null;
var _ThisUserID = null;
var FriendsData = [];

ipcRenderer.send('friends', "");

ipcRenderer.on('friendsResponse', (event, arg) => {
	if (arg != null) {
		_ThisUserID = arg._id.toString();
		_ThisUserData = arg;
		placeProfileImage();
		$.ajax({
			url: "https://vmev.herokuapp.com/getfriendspeer",
			type: "post",
			data: JSON.stringify({
				_id: _ThisUserID
			}),
			dataType: "json",
			contentType: "application/json",
			success: function (data) {
				let peopleContactList = "";
				let peopleMessages = "";
				data.server.forEach(function (element) {
					//dodacu data-peer tako da posle mogu da podesavam stvari i da lako pozovem na koga se odnosi
					//console.log(element);
					let uiPeerID = element.peerID || element._id;
					FriendsData.push({
						_id: element._id,
						peerID: uiPeerID
					});
					let imgurl = element.imgUrl;
					if (!imgurl) {
						imgurl = 'images/app/default_user.png';
					}

					peopleContactList += "<li class='person' data-person='" + element._id + "' data-peerid='" + uiPeerID + "'>" +
						"<img src='" + imgurl + "'/>" +
						"<span class='name'>" + element.firstName + " " + element.lastName + "</span>" +
						"<div>" + //status-online za kod ispod
						"<span class='login-status status-offline'></span>" + //ovo se podesava posle kada pocne da se konektuje sa svima
						"<span class='status-text'>Offline</span>" + //isto vazi -> Online or Offline
						"</div>" +

						// ovo se radi ako dobije neku notifikaciju pa se posle dodaje 
						"<div class='single-person-notification'></div>" +

						"</li>";
					peopleMessages += "<div class='chat' data-chat='" + uiPeerID + "'></div>";
				}, this);
				$(".people").html(peopleContactList);
				$(".message-container").prepend(peopleMessages);
				//arg = _id , data.server = array.friends
				ConnectWithFriends(_ThisUserID, data.server);
			},
			error: function (err) {
				//alert("err:" + JSON.stringify(err));
				popupAlert('Friend list', 'Your friend list is empty. Type email in search and find friends.');
			},
			beforeSend: function () {
				$("#loading-people").fadeIn();
			},
			complete: function () {
				$("#loading-people").fadeOut();
			}
		});
		CheckForFriendsRequests();

	} else {
		ipcRenderer.send('close', "");
	}
});


function CheckForFriendsRequests() {
	let $loadingPeople = $('#loading-people');
	let $searched_people = $('.searched-people');

	$.ajax({
		url: "https://vmev.herokuapp.com/getfriendsrequests",
		type: "post",
		data: JSON.stringify({
			"_id": _ThisUserID.toString()
		}),
		dataType: "json",
		contentType: "application/json",
		success: function (data) {
			data.server.forEach(function (element) {

				let uiPeerID = element.peerID || element._id;
				let imgurl = element.imgUrl;

				if (!imgurl) {
					imgurl = 'images/app/default_user.png';
				}

				let peopleContactList = "<li class='search-person' data-person='" + element._id + "' data-peerid='" + uiPeerID + "'>" +
					"<img src='" + imgurl + "'/>" +
					"<span class='name'>" + element.firstName + " " + element.lastName + "</span>" +
					"<div>" +
					"<span class='email'>" + element.email + "</span>" +
					"</div>" +
					"<div class='addDropFriend'>" +
					"<button class='addFriend twoButtons' onclick='addNewFriend( " + JSON.stringify(element) + " );'></button>" +
					"<button class='dropFriend' onclick='dropfriendrequest( " + JSON.stringify(element) + " );'></button>" +
					"</div>" +
					"</li>";
				$searched_people.append(peopleContactList);
			}, this);
			/*
			$searched_people.css({
				display: 'block'
			});*/
			let newHeight = 54 + 72 * (1 + (data.server.length >= 3 ? 3 : data.server.length));
			$people.css({
				height: 'calc( 100% - ' + newHeight + 'px)'
			});
		},
		error: function (err) {
			if (err.status == 404) {
				/*
				$searched_people.css({
					display: 'none'
				});*/
			} else {
				popupAlert('Search friends online ', err);
				console.log(err);
			}
		},
		beforeSend: function () {
			$loadingPeople.css('display', 'block');
			$people.append("<li class='spacer'></li>");
		},
		complete: function () {
			$loadingPeople.css('display', 'none');
		}

	})
}

ipcRenderer.on('uploadProfileImage', (event, arg) => {
	$("#UploadCropImage").html("<iframe id='iframeUploadCrop' src='uploadcrop.html'></iframe>");
});

function placeProfileImage() {
	if (_ThisUserData.imgUrl)
		$("#userProfileImg").attr("src", _ThisUserData.imgUrl);
}

function GetThisUserId() {
	return _ThisUserID;
}

function __sync() {
	if (!(_activeEditInfo.userPeerId || _acctiveCallInfo.userPeerId)) {
		ipcRenderer.send('sync', 1);

	} else {
		popupYesNo('Synchronization', 'You have open connection with friend. If you continue, all connections will be closed.');
		popupBindButtons(
			function (e) {
				ipcRenderer.send('sync', 1);
			},
			function (e) {
				//close popup
			}
		);
	}
}

function UseIcpRenderer(route, data) {
	ipcRenderer.send(route, data);
}
ipcRenderer.on('EditorFileSaved', function (event, data) {
	popupAlert('Success', 'Edit file is saved');
});