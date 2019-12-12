// Grab the articles as JSON
$.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
        // Display the info on the page

        var newDiv = $("<div>");
        newDiv.addClass("individual-article");

        var newPara = $("<p>");
        newPara.text(data[i].title);
        newPara.addClass("article-title");
        newPara.attr("data-id", data[i]._id);
        newDiv.append(newPara);

        var newLink = $("<a>");
        newLink.text("Link to the original article");
        newLink.attr("href", data[i].link);
        newLink.attr("target", "_blank");
        newDiv.append(newLink);

        $("#articles").append(newDiv); 
    }
});

$(document).on("click", ".article-title", function() {
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
    .then(function(data) {
        console.log(data);

        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input field for a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A text field for your note
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>")
        // A button to submit a new note, with the ID of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "'id='savenote'>Save Note</button>");

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
$(document).on("click", "#savenote", function() {

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
    .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
    });

    // Remove the values entered in the input and the textarea
    $("#titleinput").val("");
    $("#bodyinput").val("");
});