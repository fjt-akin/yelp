	// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.validated-form')

  // Loop over them and prevent submission
  Array.from(forms) 
    .forEach( form => {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()


const isStarChecked = () =>{
	const button = document.querySelector('#rSubmit')
	const rbs = document.querySelectorAll('input[name="review[rating]"]');
	
	for(let rb of rbs){
		rb.checked;
		rb.addEventListener('click', function(){
			rb.checked = true
			if(rb.checked){
				button.disabled = false;
			}
		})
	}
}
isStarChecked();