//ovo je dodato samo radi testiranja
$('.chat[data-chat=person3]').addClass('active-chat');
$('.person[data-chat=person3]').addClass('active');

$('.left .person').mousedown(function(){
	//
	// If tool == message go on , else fail
	//
	if(!$(".features .tools li[data-tool=message]").hasClass('tool-active')){
		return false;
	}
    if ($(this).hasClass('.active')) {
        return false;
    } else {
        var findChat = $(this).attr('data-chat');
        var personName = $(this).find('.name').text();
        $('.right .top .name').html(personName);
        $('.chat').removeClass('active-chat');
        $('.left .person').removeClass('active');
        $(this).addClass('active');
        $('.chat[data-chat = '+findChat+']').addClass('active-chat');
		
		$(".active-chat").scrollTop($(".active-chat")[0].scrollHeight);
		
		animation();
    }
});

function animation(){
	if($(".right .active-chat .bubble:nth-child(2)").attr("style") != undefined){
		//
		//	this is for performanse
		//	if he got duration dont calc it again
		//
		return false;
	}
	
	var number = $('.right .active-chat').children().length - 1;
	$(".right .active-chat .bubble").each(function(index){
		$(this).css({
			'animation-duration' : 0.1*(1+ number - index) + 's'
		});
	});
}
animation();