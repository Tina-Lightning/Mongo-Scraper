// Grab the articles as JSON
$.getJSON("/articles", function (data) {
    for (var i = 0; i < data.length; i++) {
        // Display the info on the page

        var newDiv = $("<div>");
        newDiv.addClass("card");

        var newRow = $("<div>");
        newRow.addClass("row");

        var newColLeft = $("<div>");
        newColLeft.addClass("col-2");

        var newColRight = $("<div>");
        newColRight.addClass("col-10");

        var newImage = $("<img>");
        newImage.addClass("article-img");
        newImage.addClass("img-fluid");
        newImage.attr("src", data[i].image);
        newColLeft.append(newImage);

        var newTitle = $("<p>");
        newTitle.text(data[i].title);
        newTitle.addClass("article-title");
        newColRight.append(newTitle);

        var newPara = $("<p>");
        newPara.text(data[i].summary);
        newColRight.append(newPara);

        var newLink = $("<a>");
        newLink.text("Link to the original article");
        newLink.attr("href", data[i].link);
        newLink.attr("target", "_blank");
        newColRight.append(newLink);
        newColRight.append("<hr/>");

        var newSaveButton = $("<button>");
        newSaveButton.text("Save Article")
        newSaveButton.attr("data-id", data[i]._id);
        newSaveButton.attr("id", "savearticle");
        newSaveButton.addClass("btn btn-info");
        newColRight.append(newSaveButton);

        var newAddNote = $("<button>");
        newAddNote.text("Add Note")
        newAddNote.attr("data-id", data[i]._id);
        newAddNote.attr("id", "newnote");
        newAddNote.addClass("btn btn-secondary");
        newColRight.append(newAddNote);

        newRow.append(newColLeft, newColRight)

        newDiv.append(newRow);

        $("#articles").append(newDiv);
    }
});

// When you click the Get New Articles button
$(document).on("click", "#scrape", function() {
    $("#message").text("Articles are up to date.")
  
    $.ajax({
      method: "GET",
      url: "/scrape"
    })
    .done(function (data) {
        window.location.reload();
    })
  });

$(document).on("click", "#newnote", function () {
    // Empty the notes from the note section
    $("#notes").empty();

    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // add the note info to the page 
        .then(function (data) {
            console.log(data);

            var newForm = $("<form>");
            var newDiv = $("<div>");
            newDiv.addClass("form-group");

            var newHeader = $("<label>");
            newHeader.text(data.title);
            newHeader.addClass("note-title");

            var newInput = $("<input>");
            newInput.attr('id', 'titleinput');
            newInput.attr('name', 'title');
            newInput.addClass("form-control");

            var newTextField = $("<textarea>");
            newTextField.attr('id', 'bodyinput');
            newTextField.attr('name', 'body');
            newTextField.addClass("form-control");

            var newButton = $("<button>");
            newButton.attr("data-id", data._id);
            newButton.attr("id", "savenote");
            newButton.addClass("btn btn-primary");
            newButton.text("Save Note");

            newDiv.append(newHeader, newInput, newTextField, newButton);

            newForm.append(newDiv);

            $("#notes").append(newForm);

            // If there's already a note...
            if (data.note) {
                // Put the title in the title field
                $("#titleinput").val(data.note.title);
                // Put the body in the body field
                $("#bodyinput").val(data.note.body);
            }
        });

});

// Saving a note
$(document).on("click", "#savenote", function () {

    // Get the id associated with the article
    var thisId = $(this).attr("data-id");

    // Run a POST request to save/update the Note
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from the title input
            title: $("#titleinput").val(),
            // Value taken from the textarea
            body: $("#bodyinput").val()
        }
    })
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Remove the values entered in the input and the textarea
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

// When you click the Save Article button
$(document).on("click", "#savearticle", function () {
    $(this).text("Saved 👍");
    var thisId = $(this).attr("data-id");
    console.log(thisId);

    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    })
        .done(function (data) {
            window.location.reload();
        })
});
