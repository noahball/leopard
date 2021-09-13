const queryString = window.location.search;
if(queryString == '?signed-in=success') {
  Swal.fire({
    icon: 'success',
    title: 'Thanks!',
    text: 'You\'ve checked in successfully!',
  })
}