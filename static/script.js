const queryString = window.location.search;
if(queryString == '?signed-in=success') {
  Swal.fire({
    icon: 'success',
    title: 'Thanks!',
    text: 'You\'ve checked in successfully!',
  })
} else if(queryString == '?signed-in=incomplete') {
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'Please fill in both your name and tutor class.',
  })
} else if(queryString == '?result=incomplete') {
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'Please fill in all fields.',
  })
}