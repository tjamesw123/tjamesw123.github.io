//<script id="__NEXT_DATA__" type="application/json">...</script>


var URLtoOriginDepartment = new Map([
    ["https://www.stevens.edu/school-engineering-science/faculty", "Engineering and Science"],
    ["https://www.stevens.edu/hass/hass-faculty", "Humanities, Arts and Social Sciences"],
    ["https://www.stevens.edu/school-business/faculty", "Business"]
]);

const facultyButton = document.getElementById('facultyButton');
facultyButton.addEventListener('click', function() {
        console.log("Faculty Button Pressed");
        var websitesToSearch = ["https://www.stevens.edu/school-engineering-science/faculty", "https://www.stevens.edu/hass/hass-faculty", "https://www.stevens.edu/school-business/faculty"];
        console.log(websitesToSearch[0]);
        var htmlText2 = fetchWebsiteHTML(websitesToSearch[0]);
        
});

async function fetchWebsiteHTML(url) {
    var a = await fetch(url); 
    var htmlText = await a.text();
    console.log(htmlText);
    var groupsRegex = /(<script id="__NEXT_DATA__" type="application\/json">)(.+)(<\/script>)/.exec(htmlText);
    console.log(groupsRegex);
    console.log("HEYYY");
    return htmlText;
}
