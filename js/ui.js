//
// init starting tool -> message 
//
$('.features .tools li[data-tool=message]').addClass('tool-active');
var tool = "message";
var chosenPerson = null;
//
// this change class of tool meni
//
$('.features .tools li').mousedown(function(){
	//
	// if clicked element have class -> stop action
	//
	if ($(this).hasClass('tool-active')){
        return false;
    } 
	else {	
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
		$('.container-fluid .right .'+tool+'-container').addClass('active-right-container');
		//
		// calling render function to render stuff for person
		//
		render();
    }
});

//
// This is for people selection
//
$('.left .person').mousedown(function(){
	
	if(!$(".container-fluid .right .choose-container").hasClass('hide-default')){
		$(".container-fluid .right .choose-container").addClass('hide-default');
	}
	//
	// if clicked person have class active -> stop action
	//
	if(!personExist()){
		//
		// remove all classes named a-r-c for first layer only
		//
		$('.container-fluid .right ').children().removeClass('active-right-container');
		//
		// add class to clicked element
		//
		$('.container-fluid .right .'+tool+'-container').addClass('active-right-container');
		
	}
    if ($(this).hasClass('active')) {
        return false;
    } 
	else {
		//
		// remove all person tags
		//
        $('.left .person.active').removeClass('active');
        $(this).addClass('active');
		chosenPerson = $(this).attr('data-person');
		
		render(this);
    }
});

//
// this function choose what to render for user
//
function render(obj){
	if(personExist()){
		if(tool == "voice"){
			voiceRender();
		}
		else if(tool == "message"){
			messageRender(obj);
		}
		else if(tool == "edit"){
			editRender();	
		}
		else if(tool == "video"){
			videoRender();
		}
	}
}

function voiceRender(){ 
	//console.log('voice');
}
function messageRender(){
	//
	// Remove class from existing elements and adding class to clicked element
	//
    $('.chat.active-chat').removeClass('active-chat');
    $('.chat[data-chat = '+chosenPerson+']').addClass('active-chat');
	
	//
	// scrolling messages to bottom
	//
	$(".active-chat").scrollTop($(".active-chat")[0].scrollHeight);
	
	
	if($(".right .active-chat .bubble:nth-child(2)").attr("style") != undefined){
		//
		//	this is for performanse
		//	if he got duration dont calc it again
		//
		return false;
	}
	
	//
	// adding animation to messages 
	//
	var number = $('.right .active-chat').children().length - 1;
	$(".right .active-chat .bubble").each(function(index){
		$(this).css({
			'animation-duration' : 0.1*(1+ number - index) + 's'
		});
	});
}
function editRender(){
	
}
function videoRender(){
	
}

function personExist(){
	if(chosenPerson == null){
		return false;
	}
	return true;
}



//
//	Starting application
//
render();