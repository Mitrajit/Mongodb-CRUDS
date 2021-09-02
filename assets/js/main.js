$('[data-toggle="tooltip"]').tooltip();

// Select/Deselect checkboxes
var checkedids = [];
var checkbox = $('table tbody input[type="checkbox"]');
$("#selectAll").click(function () {
  if (this.checked) {
    checkbox.each(function () {
      this.checked = true;
      checkedids.push($(this.closest('tr')).data('id'));
    });
  } else {
    checkedids = [];
    checkbox.each(function () {
      this.checked = false;
    });
  }
});
checkbox.click(function () {
  if (!this.checked) {
    $("#selectAll").prop("checked", false);
    let index = checkedids.indexOf($(this.closest('tr')).data('id'))
    if (index != -1)
      checkedids.splice(index, 1);
  }
  else
    checkedids.push($(this.closest('tr')).data('id'));
});
// Deletion
$(".delete").click((e) => {
  console.log(e.currentTarget.parentNode);
  Delete([$(e.currentTarget.closest('tr')).data('id')]);
});
$('#deleteall').click(e=>Delete(checkedids));
function Delete(id) {
  if (id.length>0 && confirm("Do you want to permanently delete this record?")) {
    fetch('/delete', {
      method: 'delete',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
      .then(res => {
        if (res.ok) return res.status
      })
      .then(response => {
        if (response == 202) {
          window.location.reload(true);
        }
      })
      .catch(console.error);
  }
}
// Editing/updating
$('#editUserModal').on('show.bs.modal', function (e) {
  let row = e.relatedTarget.closest('tr');
  let Id = $(row).data('id');
  let children = row.children;
  $(e.currentTarget).find('input[name="id"]').val(Id);
  $(e.currentTarget).find('input[name="name"]').val(children[2].innerText);
  $(e.currentTarget).find('input[name="phone"]').val(children[3].innerText);
  $(e.currentTarget).find('input[name="email"]').val(children[4].innerText);
  $(e.currentTarget).find('input[name="hobbies"]').val(children[5].innerText);
});
$('#editUserForm').submit(e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const value = Object.fromEntries(data.entries());
  fetch('/update', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value)
  }).then(res => {
    if (res.status == 202)
      window.location.reload(true);
  });
  $('#editUserModal').modal('hide');
});
// Send mail
$('#sendmail').click(e=>{
  if(checkedids.length==0)
  alert("No item selected to send");
  else
  {
    let mailbody="The requested user details are as follows:\n\n";
    Array.from($('table tbody').children()).forEach(row=>{
      console.log(row);
      if($(row.children[0]).find('input[type="checkbox"]').prop('checked')){
        console.log("True");
        mailbody+="ID: "+row.children[1].innerText+"\n";
        mailbody+="Name: "+row.children[2].innerText+"\n";
        mailbody+="Phone: "+row.children[3].innerText+"\n";
        mailbody+="Email: "+row.children[4].innerText+"\n";
        mailbody+="Hobbies: "+row.children[5].innerText+"\n\n";
    }
    });
    console.log(mailbody);
    window.open("mailto:info@redpositive.in?subject=Users details&body="+encodeURIComponent(mailbody));
  }
  });