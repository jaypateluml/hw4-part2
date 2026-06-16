// Jay Patel
// COMP 4610 GUI I - HW4 Part 2

// assignment range
var MIN_ALLOWED = -50;
var MAX_ALLOWED = 50;

// counter for uniqe tab ids
var tabCount = 0;

$(document).ready(function () {

    // jQuery UI tabs and sliderss
    $("#tabs").tabs();

    // one slider per box, linked both ways
    linkSlider("#sliderMinCol", "#minCol");
    linkSlider("#sliderMaxCol", "#maxCol");
    linkSlider("#sliderMinRow", "#minRow");
    linkSlider("#sliderMaxRow", "#maxRow");

    // validaton (same as part 1)
    setUpValidation();

    // delete all the table tabs
    $("#deleteAll").click(function () {
        $("#tabs ul li").remove();
        $("#tabs > div").remove();
        $("#tabs").tabs("refresh");
    });

    // delete one tab on the x
    $("#tabs").on("click", ".closeTab", function () {
        var panelId = $(this).closest("li").find("a").attr("href");
        $(this).closest("li").remove();
        $(panelId).remove();
        $("#tabs").tabs("refresh");
    });

    // empty preview at start
    updatePreview();
});


// links a slider and box both ways
function linkSlider(sliderId, inputId) {
    $(sliderId).slider({
        min: MIN_ALLOWED,
        max: MAX_ALLOWED,
        value: parseInt($(inputId).val(), 10) || 0,
        // slider -> box
        slide: function (event, ui) {
            $(inputId).val(ui.value);
            updatePreview();
        }
    });

    // box -> slider when you type
    $(inputId).on("keyup change", function () {
        var typed = parseInt($(this).val(), 10);
        if (!isNaN(typed) && typed >= MIN_ALLOWED && typed <= MAX_ALLOWED) {
            $(sliderId).slider("value", typed);
        }
        updatePreview();
    });
}


// only returns a number if its a clean whole number in range
function readValid(inputId) {
    var raw = $.trim($(inputId).val());
    if (!/^-?\d+$/.test(raw)) {
        return NaN;
    }
    var n = parseInt(raw, 10);
    if (n < MIN_ALLOWED || n > MAX_ALLOWED) {
        return NaN;
    }
    return n;
}


// redraw preview on any change, only if all 4 are valid
function updatePreview() {
    var minCol = readValid("#minCol");
    var maxCol = readValid("#maxCol");
    var minRow = readValid("#minRow");
    var maxRow = readValid("#maxRow");

    var allValid = !isNaN(minCol) && !isNaN(maxCol) && !isNaN(minRow) && !isNaN(maxRow);

    if (allValid && minCol <= maxCol && minRow <= maxRow) {
        $("#preview").html(buildTableHTML(minCol, maxCol, minRow, maxRow));
    } else {
        $("#preview").html("<p class='hint'>Move the sliders or type four valid numbers to see a preview.</p>");
    }
}


// set up validaton
function setUpValidation() {

    // digits wont allow negatives
    $.validator.addMethod("wholeNumber", function (value, element) {
        return this.optional(element) || /^-?\d+$/.test(value);
    }, "Please enter a whole number like 5 or -3 (no decimals or letters).");

    // min cant be bigger than its max box
    $.validator.addMethod("notBigger", function (value, element, otherId) {
        var other = parseInt($(otherId).val(), 10);
        var mine = parseInt(value, 10);
        if (isNaN(other) || isNaN(mine)) {
            return true;
        }
        return mine <= other;
    }, "The minimum is bigger than its maximum. Lower this value or raise the maximum.");

    $("#tableForm").validate({
        rules: {
            minCol: { required: true, wholeNumber: true, range: [MIN_ALLOWED, MAX_ALLOWED], notBigger: "#maxCol" },
            maxCol: { required: true, wholeNumber: true, range: [MIN_ALLOWED, MAX_ALLOWED] },
            minRow: { required: true, wholeNumber: true, range: [MIN_ALLOWED, MAX_ALLOWED], notBigger: "#maxRow" },
            maxRow: { required: true, wholeNumber: true, range: [MIN_ALLOWED, MAX_ALLOWED] }
        },
        messages: {
            minCol: {
                required: "Please type the minimum column value.",
                range: "The minimum column must be from -50 to 50."
            },
            maxCol: {
                required: "Please type the maximum column value.",
                range: "The maximum column must be from -50 to 50."
            },
            minRow: {
                required: "Please type the minimum row value.",
                range: "The minimum row must be from -50 to 50."
            },
            maxRow: {
                required: "Please type the maximum row value.",
                range: "The maximum row must be from -50 to 50."
            }
        },
        errorPlacement: function (error, element) {
            // put error under the slider so it doesnt cover the handle
            error.insertAfter(element.next(".slider"));
        },
        // only runs if valid, no bad tab or reload
        submitHandler: function (form) {
            addTableTab();
            return false;
        }
    });
}


// read boxes and open table in a new tab
function addTableTab() {
    var minCol = parseInt($("#minCol").val(), 10);
    var maxCol = parseInt($("#maxCol").val(), 10);
    var minRow = parseInt($("#minRow").val(), 10);
    var maxRow = parseInt($("#maxRow").val(), 10);

    tabCount++;
    var id = "tableTab" + tabCount;

    // label tab with the 4 values
    var label = "Col " + minCol + " to " + maxCol + ", Row " + minRow + " to " + maxRow;

    // tab button + little x to close it
    var li = "<li><a href='#" + id + "'>" + label + "</a>" +
             "<span class='closeTab' title='delete this tab'>&times;</span></li>";
    $("#tabs ul").append(li);

    // panel with the table
    var panel = "<div id='" + id + "'><div class='tableArea'>" +
                buildTableHTML(minCol, maxCol, minRow, maxRow) + "</div></div>";
    $("#tabs").append(panel);

    // refresh tabs and jump to the new one
    $("#tabs").tabs("refresh");
    $("#tabs").tabs("option", "active", $("#tabs ul li").length - 1);
}


// build the table in html
function buildTableHTML(minCol, maxCol, minRow, maxRow) {
    var html = "<table>";

    // top row colmun numbers
    html += "<thead><tr><th></th>";
    for (var c = minCol; c <= maxCol; c++) {
        html += "<th>" + c + "</th>";
    }
    html += "</tr></thead>";

    // rows and the answerss
    html += "<tbody>";
    for (var r = minRow; r <= maxRow; r++) {
        html += "<tr><th>" + r + "</th>";
        for (var c2 = minCol; c2 <= maxCol; c2++) {
            html += "<td>" + (r * c2) + "</td>";
        }
        html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
}
