var action = "signin";
		$("form").hide();
		
		$( document ).ready(function() {
			$("form").fadeIn(500);
			//$("#email").attr({'required':'required' , 'title': 'Example: something@gmail.com', 'pattern': '/^\S+@\S+\.\S{2,4}$/'});
		});
		
		$('input[type=radio][name=action]').change(function() {
			
			$("#pass, #repass, #firstName, #lastName").each(function(){
				$(this).removeAttr("required pattern maxlength minlength title");
			});
			
			if (this.value == 'signin') {
				$("#pass").attr({
					"required"  : "required",
					"minlength" : "5",
					"maxlength" : "128"
				});
			}
			else if (this.value == 'signup') {
				$("#pass").attr({
					"required"  : "required",
					"minlength" : "5",
					"maxlength" : "128"
				});
				$("#repass").attr({
					"required"  : "required",
					"minlength" : "5",
					"maxlength" : "128"
				});
				
				$("#firstName").attr({
					"required"  : "required",
					"minlength" : "2",
					"maxlength" : "30"
				});
				$("#lastName").attr({
					"required"  : "required",
					"minlength" : "2",
					"maxlength" : "40"
				});
			}
			else if(this.value == 'reset'){
				//nothing
			}
			action = this.value;
		});
		
		
		$('#loading').hide();
		
		function regex(){
			if(action == "signup" && $("#pass").val() != $("#repass").val()){
				//
				//	Adding custom validation error message
				//
				document.getElementById("repass").setCustomValidity("Passwords Don't Match");
				//
				//	This is for forcing Chrom to validate/report errors  
				//
				document.getElementById("form").reportValidity();
				
				//
				//stoping action
				//
				return false;
			}
			
			$.ajax({
				url: "http://localhost:3000/login",
				type: "post",
				data: {},
				success: function (data){
					alter("data:"+JSON.stringify(data));
				},
				error: function(err){
					alert("err:"+JSON.stringify(err));
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
			
			
			return false;
		}
		
		function repass_check(){
			if(!(action == "signup" && $("#pass").val() != $("#repass").val())){
				//
				// Removing popup on correct submit
				//
				document.getElementById("repass").setCustomValidity("");
			}
			return true;
		}