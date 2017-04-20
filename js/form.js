const {ipcRenderer} = require('electron');
var action = "signin";
$("form").hide();

$( document ).ready(function() {
	$("form").fadeIn(500);
});

$('input[type=radio][name=action]').change(function() {
	action = this.value;
	$("#pass").removeAttr("tabindex");
	if (action == 'signin') {
		$("#repass , #firstName , #lastName").each(function(){
			$(this).attr("tabindex" , "-1");
		});
	}
	else if (action == 'signup') {
		$("#repass , #firstName , #lastName").each(function(){
			$(this).removeAttr("tabindex");
		});
	}
	else if(action == 'reset'){
		$("#repass , #firstName , #lastName , #pass").each(function(){
			$(this).attr("tabindex" , "-1");
		});
	}
});


$('#loading').hide();

function regex(){
	var url = "";
	var msg = null;
	var userdata = {};
	if (action == 'signin') {
		
		url = "login";
		
		msg = _regex([
			["email","email"],
			["password","password"]
		]);
		userdata["email"] = $("#email").val();
		userdata["password"] = $("#pass").val();
	}
	else if (action == 'signup') {
		
		url = "register";
		
		msg = _regex([
			["email","email"],
			["password","password"],
			["repass","password"],
			["firstName","fname"],
			["lastName","lname"]
		]);
		userdata["email"] = $("#email").val();
		userdata["password"] = $("#pass").val();
		userdata["repass"] = $("#repass").val();
		userdata["firstName"] = $("#firstName").val();
		userdata["lastName"] = $("#lastName").val();
	}
	else if(action == 'reset'){
		
		url = "resetpassword";
		
		msg = _regex([
			["email","email"]
		]);
		userdata["email"] = $("#email").val();
	}
	
	if(msg){
		alert(msg);
		return false;
	}
	
	
	
	if(action == "signup" && $("#pass").val() != $("#repass").val()){
		//
		//stoping action
		//
		alert("[password and repeated password] are different");
		return false;
	}

	$.ajax({
		url: "http://localhost:3000/"+url,
		type: "post",
		data: JSON.stringify(userdata),
		dataType: "json",
		contentType: "application/json",
		success: function (data){
			alert("data:"+JSON.stringify(data));
			ipcRenderer.send('async', data);
		},
		error: function(err){
			alert("err:"+JSON.stringify(err));
			ipcRenderer.send('async', -1);
		},
		beforeSend: function(){
			$("#loading").fadeIn();
			$("#container").fadeOut();

		},
		complete: function(){
			$("#loading").fadeOut();
			$("#container").fadeIn();
		}
	});
}

//
//	regex
//

function _regex(value){
	/*
	value => 
		
		[
			["email","email"],
			["password","passs"]
		]
		
	*/
	var 
	__regex = {} ,
	__msg = {},
	error = 0,
	error_string = "";
	
	__regex['email'] = /^\S+@\S+\.\S{2,4}$/;
	__regex['password']  = /^\S{8,128}$/;
	__regex['fname'] = /^\w{2,30}$/;
	__regex['lname'] = /^\w{2,40}$/;
	
	__msg['email'] = "email error";
	__msg['password']  = "password error";
	__msg['fname'] = "first name error";
	__msg['lname'] = "last name error";
	
	
	for(var i = 0; i < value.length; i++){
		if(!__regex[value[i][1]].test($('#' + value[i][0]).val())){
			error_string += __msg[value[i][1]] + "\n";
		}
	}
	return error_string;
}

/*

// WORKS

ipcRenderer.send('async', 5);

ipcRenderer.on('async-reply' , function(event, arg){
	console.log(arg);
});*/