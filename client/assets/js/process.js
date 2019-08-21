//login process

$(document).ready(function() {
  // alert('process..........');
  $("form[name='login']").submit(function(event) {
    event.preventDefault();
    console.log('.....login1....');
    if (document.getElementById("email").value == '' && document.getElementById("password").value == '') {
      return;
    }
    var userdata = $(this).serialize();

    $.post('/userlogin', userdata, function(data) {
        console.log(data);
        window.localStorage.setItem('userid', data);
        window.location = "/home";
      })
      .fail(function(response) {
        alert(response.responseText);
      })
  });
  //registerrrrrrrrrrrrrrrr
  $("form[name='register']").submit(function(event) {
    event.preventDefault();
    console.log('.....register....');
    if (document.getElementById("email").value == '' && document.getElementById("password").value == '' && document.getElementById("name").value == '') {
      return;
    }
    var userdata = $(this).serialize();

    $.post('/userregister', userdata, function(data) {
        console.log(data);
        window.localStorage.setItem('userid', data);
        window.location = "/home";
      })
      .fail(function(response) {
        alert(response.responseText);
      })
  });



  // console.log(new URL(window.location.href).pathname);
  if ('/home' == new URL(window.location.href).pathname) {
    $(document).ready(function() {
      home();


      function home() {
        if (!window.localStorage.getItem('userid')) {
          return window.location = "/login";
        }
        var data = window.localStorage.getItem('userid');
        console.log(data);
        $.get('/home_data/' + data, function(db_data) {
          console.log(db_data);
          var table = document.getElementById('table');
          for (let i = 0; i < db_data.length; i++) {


            var row = table.insertRow()
            row.insertCell(0).innerHTML = `<input type='text' name='product_id' value=${db_data[i].product_id} readonly>`;
            row.insertCell(1).innerHTML = `<input type='text' name='product_name' value=${db_data[i].product_name} readonly>`;
            row.insertCell(2).innerHTML = `<input type='text' name='product_owner' value=${db_data[i].product_owner} readonly>`;
            row.insertCell(3).innerHTML = `<input type='text' name='product_owner_id' value=${db_data[i].product_owner_id} readonly>`;
            row.insertCell(4).innerHTML = `<input type='text' name='product_url' value=${db_data[i].product_url} readonly>`;

            var button = document.createElement('input');
            button.setAttribute('type', 'button');
            button.setAttribute('value', 'edit');
            button.setAttribute('product_objId', db_data[i]._id);
            //button.setAttribute('onclick', "window.location = '/product_register?id=' + document.getElementById('edit').getAttribute('product_objId')");
            button.setAttribute('id', 'edit');
            row.insertCell(5).appendChild(button);

            var button1 = document.createElement('input');
            button1.setAttribute('type', 'button');
            button1.setAttribute('value', 'delete');
            //button1.setAttribute('onclick', 'del(this)');
            button1.setAttribute('id', 'delete');
            row.insertCell(6).appendChild(button1);
          }
        });
      }






      //add product row
      $("button[name='add_product']").click(function(event) {
        event.preventDefault();
        $.get('/getrowcount/send', function(data) {
          window.localStorage.setItem('rowcount', data[0].product_id);
          var row1 = `<tr><td><input type='text'name='product_id' value=${data[0].product_id+1} READONLY> </td><td> <input type = 'text' name='product_name'> </td> <td> <input type = 'text' name='product_owner'> </td> <td> <input type = 'text' name='product_owner_id' value=${window.localStorage.getItem('userid')} readonly> </td> <td> <input type = 'text' name='product_url'> </td>  </tr > `;
          $("#table").append(row1);
          $("button[name='add_product']").hide();
          $('form').append('<button type=submit name=insert>insert</button>');
        })
      });

      $(document).on('click', "button[name='insert']", function(event) {
        event.preventDefault();

        let product_data = {
          product_id: $("#table").find("tr").last().children().children("[name=product_id]").val(),
          product_name: $("#table").find("tr").last().children().children("[name=product_name]").val(),
          product_owner: $("#table").find("tr").last().children().children("[name=product_owner]").val(),
          product_owner_id: $("#table").find("tr").last().children().children("[name=product_owner_id]").val(),
          product_url: $("#table").find("tr").last().children().children("[name=product_url]").val(),

        }
        console.log(product_data);

        $.post('/insert_data', product_data, function(data) {
          alert(data);
          $("#table td").parent().remove();
          home();
        })
      });

      $(document).on('click', "#edit", function(event) {
        event.preventDefault();
        $(":button").not("#logout").attr("disabled", true);
        $(this).parent().parent().children().children("[name=product_name],[name=product_url]").attr("readonly", false);
        $(this).parent().parent().children().children("#edit").attr({
          'value': 'update',
          "id": "update",
          "disabled": false
        });
        $(this).parent().parent().children().children("#delete").attr({
          'value': 'cancel',
          "id": "cancel",
          "disabled": false
        });
      });

      $(document).on('click', "#cancel", function(event) {
        event.preventDefault();
        $("#table td").parent().remove();
        $(":button").attr("disabled", false);
        home();
      });

      $(document).on('click', "#update", function(event) {
        var updatedata = {
          product_name: $(this).parent().parent().children().children("[name=product_name]").val(),
          product_url: $(this).parent().parent().children().children("[name=product_url]").val(),
          obj_id: $(this).parent().parent().children().children("#update").attr('product_objid')
        };

        $.post('/update_data', updatedata, function(data) {
          alert(data);
          $(":button").attr("disabled", false);
          $("#table td").parent().remove();
          home();
        })
      });

      $(document).on('click', "#delete", function(event) {
        alert('delete');
        let row = JSON.stringify({
          index: $(this).parent().parent().children().children("#edit").attr('product_objid'),
          owner_id: $("#table").find("tr").last().children().children("[name=product_owner_id]").val()
        });

        $.ajax({
          method: "DELETE",
          url: '/delete_table',
          contentType: 'application/json; charset=utf-8',
          data: row,
          success: function(data) {
            console.log(data);
            alert(data);
            $("#table td").parent().remove();
            home();
          },
          error: function(data) {
            console.log('Error:', data);
          }




          // $.delete('/delete_table', row, function(data) {
          //   alert(data);
          //   $("#table td").parent().remove();
          //   home();
        })
      });

      $("#logout").click(function(event) {
        window.localStorage.clear();
        window.location = "/login";
      });
    });
  }
});