$('.features .tools li[data-tool=message]').addClass('tool-active');

$('.features .tools li').mousedown(function(){
	if ($(this).hasClass('tool-active')) {
        return false;
    } else {
		
        //
		// ovde odradi na klik citanje drugog bodija umesto chat
		//
		
        $('.features .tools li').removeClass('tool-active');
        $(this).addClass('tool-active');
    }
});