const {
	ipcRenderer
} = require('electron');

let action = 'signin';
$("form").hide();

$(document).ready(function () {
	$("form").fadeIn(500);
});

$('input[type=radio][name=action]').change(function () {
	action = this.value;
	$("#pass").removeAttr("tabindex");
	$("#email").focus();
	if (action == 'signin') {
		$("#repass , #firstName , #lastName").each(function () {
			$(this).attr("tabindex", "-1");
		});
	} else if (action == 'signup') {
		$("#repass , #firstName , #lastName").each(function () {
			$(this).removeAttr("tabindex");
		});
	} else if (action == 'reset') {
		$("#repass , #firstName , #lastName , #pass").each(function () {
			$(this).attr("tabindex", "-1");
		});
	}
});


$('#loading').hide();

function regex() {
	let url = "";
	let msg = null;
	let userdata = {};
	if (action == 'signin') {

		url = "login";

		msg = _regex([
			["email", "email"],
			["pass", "password"]
		]);
		userdata["email"] = $("#email").val();
		userdata["password"] = $("#pass").val();
	} else if (action == 'signup') {

		url = "register";

		msg = _regex([
			["email", "email"],
			["pass", "password"],
			["repass", "password"],
			["firstName", "fname"],
			["lastName", "lname"]
		]);
		userdata["email"] = $("#email").val();
		userdata["password"] = $("#pass").val();
		userdata["repass"] = $("#repass").val();
		userdata["firstName"] = $("#firstName").val();
		userdata["lastName"] = $("#lastName").val();
	} else if (action == 'reset') {

		url = "requesttoResetPassword";

		msg = _regex([
			["email", "email"]
		]);
		userdata["email"] = $("#email").val();
	}

	if (msg) {
		popupAlert('Form errors', msg);
		//alert(msg);
		return false;
	}

	if (action == "signup" && $("#pass").val() != $("#repass").val()) {
		//
		//stoping action
		//
		popupAlert('Form errors', 'Password and repeated password are different');
		//alert("[password and repeated password] are different");
		return false;
	}

	$.ajax({
		url: "https://vmev.herokuapp.com/" + url,
		type: "post",
		data: JSON.stringify(userdata),
		dataType: "json",
		contentType: "application/json",
		success: function (data) {
			//alert("data:"+JSON.stringify(data));
			//ipcRenderer.send('async', data);
			if (url != "requesttoResetPassword") {
				ipcRenderer.send('logged', data);
			} else {
				popupAlert("Reset password", "Check your email address for more information.");
				$("#loading").fadeOut();
				$("#container").fadeIn();
			}
		},
		error: function (err) {
			console.log(err);
			popupAlert(url.charAt(0).toUpperCase() + url.slice(1) + ' error', err.responseJSON.Server);
			//alert("err:" + JSON.stringify(err));
			$("#loading").fadeOut();
			$("#container").fadeIn();
		},
		beforeSend: function () {
			$("#loading").fadeIn();
			$("#container").fadeOut();
		}
	});
}
//
//	regex
//

function _regex(value) {
	let
		__regex = {},
		__msg = {},
		error = 0,
		error_string = "";

	__regex['email'] = /^\S+@\S+\.\S{2,4}$/;
	__regex['password'] = /^\S{8,128}$/;
	__regex['fname'] = /^\w{2,30}$/;
	__regex['lname'] = /^\w{2,40}$/;

	__msg['email'] = "Email error - [example@gmail.com]";
	__msg['password'] = "Password error - [minimum 8 characters]";
	__msg['fname'] = "First name error - [minimum 2 characters]";
	__msg['lname'] = "Last name error - [minimum 2 characters]";

	for (let i = 0; i < value.length; i++) {
		if (!__regex[value[i][1]].test($('#' + value[i][0]).val())) {
			error_string += __msg[value[i][1]] + "<br/>";
		}
	}
	return error_string;
}

$(document).keydown(function (e) {
	if (e.keyCode == 13) {
		regex();
	}

	if (e.keyCode == 9) {
		e.preventDefault();
		let focused = $(':focus');

		if (action == 'signin') {
			switch (focused.attr("id")) {
				case "email":
					$("#pass").focus();
					break;
				default:
					$("#email").focus();
					break;
			}
		} else if (action == 'signup') {
			switch (focused.attr("id")) {
				case "email":
					$("#pass").focus();
					break;
				case "pass":
					$("#repass").focus();
					break;
				case "repass":
					$("#firstName").focus();
					break;
				case "firstName":
					$("#lastName").focus();
					break;
				default:
					$("#email").focus();
					break;
			}
		}
	}
});