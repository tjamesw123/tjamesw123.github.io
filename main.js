
//JSSoup or DOMParser

async function getFileAsString(filename) {
  try {
    const response = await fetch(`./${filename}`); 

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const fileText = await response.text();
    return fileText;
  } catch (error) {
    console.error("Error fetching file:", error);
  }
}
var facultyString = "";
var facultyArr = [];
var facultyMap = new Map();

getFileAsString('faculty.txt').then(fileContent => {
  if (fileContent) {
    // console.log("File content:", fileContent);
    // document.getElementById("content-area").innerText = fileContent;
    facultyString = fileContent;
    facultyArr = facultyString.split("\n").slice(0,-1);
    
    for (var i = 0; i < facultyArr.length; i++) {
        facultyArr[i] = facultyArr[i].split("|"); 
    }
    for (var i = 0; i < facultyArr.length; i++) {
        // animals.slice(2)
        facultyMap.set(facultyArr[i][0],facultyArr[i].slice(1)); 
    }
    console.log(facultyArr);
    console.log(facultyMap);
  }
});

const daysToShortDays = new Map([
  ["Sunday", "SU"],
  ["Monday", "MO"],
  ["Tuesday", "TU"],
  ["Wednesday", "WE"],
  ["Thursday", "TH"],
  ["Friday", "FR"],
  ["Saterday", "SA"],
]);

const strToDayOfWeek = new Map([
  ["Sunday", 0],
  ["Monday", 1],
  ["Tuesday", 2],
  ["Wednesday", 3],
  ["Thursday", 4],
  ["Friday", 5],
  ["Saterday", 6],
]);

const shortBuildingToAddress = new Map([//incomplete address list for whole school
["Howe", "Wesley J. Howe Center\\, 1 Castle Point Terrace\\, Hoboken\\, NJ 07030\\, USA"],//McLean Hall, River St, Hoboken, NJ 07030, USA
["McLean", "McLean Hall\\, River St\\, Hoboken\\, NJ 07030\\, USA"],
["Peirce", "Morton-Peirce-Kidde Complex\\, 607 River St\\, Hoboken\\, NJ 07030\\, USA"],
["Carnegie", "Carnegie Laboratory\\, Hoboken\\, NJ 07030\\, USA"],
["Burchard", "524 River St #713\\, Hoboken\\, NJ 07030"],
["Kidde", "607 River St\\, Hoboken\\, NJ 07030"],
["Gateway North", "601 Hudson St\\, Hoboken\\, NJ 07030"],
["Edwin A. Stevens", "24 5th St\\, Hoboken\\, NJ 07030"],
["Gateway South", "601 Hudson St\\, Hoboken\\, NJ 07030"],
["Morton", "Morton-Peirce-Kidde Complex\\, 607 River St\\, Hoboken\\, NJ 07030\\, USA"],
["Babbio", "525 River St\\, Hoboken\\, NJ 07030"],
["North Building", "North Building\\, 1 Castle Point Terrace\\, Hoboken\\, NJ 07030\\, USA"]//McLean Hall, River St, Hoboken, NJ 07030, USA
]);


var accomendationScheduleString = "";
var classBreakDownString = "";

var ics = "";
var icsFileName = "NothingYet";
var namePerson = "";



function addDays(date, days) {
    const result = new Date(date); // Create a copy of the date
    result.setDate(result.getDate() + days); // Add the days
    return result; // Return the new date
}

// mm/dd/YYYY
function dayFromStringParser(dayStr) {
    const timeArray = dayStr.split("/");
    console.log(timeArray);

    var yearNum = "";
    if (timeArray[2].length >= 4) {
        yearNum = timeArray[2];
    } else {
        yearNum = "20"+timeArray[2];
    }

    return new Date(Number(yearNum), Number(timeArray[0])-1, Number(timeArray[1]));
}

function getFormatMonth(date) {
    var monthNum = date.getMonth()+1;
    var result = "" 
    if (monthNum >= 10) {
        result += monthNum.toString();
    } else {
        result += "0" + monthNum.toString();
    }
    return result;
}

function getFormatDay(date) {
    var dayNum = date.getDate();
    var result = "" 
    if (dayNum >= 10) {
        result += dayNum.toString();
    } else {
        result += "0" + dayNum.toString();
    }
    return result;
}

function getYearMonthDayStr(date) {
    return date.getFullYear() + getFormatMonth(date) + getFormatDay(date);
}

function getYearMonthDayStrUTC(date) {
    // console.log("date.getDate(): " + date.getDate());
    return date.getUTCFullYear() + getFormatDoubleZero(date.getUTCMonth()+1) + getFormatDoubleZero(date.getUTCDate());
}

function getFormatDoubleZero(number) {
    var result = "" 
    if (number >= 10) {
        result += number.toString();
    } else {
        result += "0" + number.toString();
    }
    return result;
}

// Get format time 9:30 AM
function getFormatTime24(timeStr) {
    // 9:30 AM
    var formatArray = timeStr.split(" ");
    var formatTimeArray = formatArray[0].split(":");
    var hours = Number(formatTimeArray[0]);
    var minutes = Number(formatTimeArray[1]);
    if (formatArray[1] == "PM" && hours != 12) {
        hours += 12;
    }
    var result = getFormatDoubleZero(hours) + getFormatDoubleZero(minutes);
    console.log(result);
    return result;

}

// I forsee a potential bug where the fact that it is assumed you are doing things in the EST time zone breaks everything
function getFormatTimeAndDateFromDO(dateTime) {
    return getYearMonthDayStr(dateTime) + "T" + getFormatDoubleZero(dateTime.getHours()) + getFormatDoubleZero(dateTime.getMinutes()) + getFormatDoubleZero(dateTime.getSeconds());
}
function getFormatTimeAndDateFromDOUTC(dateTime) {
    return getYearMonthDayStrUTC(dateTime) + "T" + getFormatDoubleZero(dateTime.getUTCHours()) + getFormatDoubleZero(dateTime.getUTCMinutes()) + getFormatDoubleZero(dateTime.getUTCSeconds()) + "Z";
}

function makeRecurrenceString(localEndDate, daysMeeting) {
    //T223456
    //RRULE:FREQ=WEEKLY;UNTIL=20230820T015615Z;WKST=SU;BYDAY=TU,TH //year month day
    //.format(DateTimeFormatter.ofPattern("yyyyMMdd")
    var result = "FREQ=WEEKLY;UNTIL=" + getYearMonthDayStr(localEndDate) + "T000000Z;WKST=SU;BYDAY=";//SU
    // console.log(result);
    var daysMeetingArr = daysMeeting.split("/");


    for (var i = 0; i < daysMeetingArr.length; i++) {
        if (i == 0) {
            result += daysToShortDays.get(daysMeetingArr[i]);
        } else {
            result += "," + daysToShortDays.get(daysMeetingArr[i]);
        }
    }
    console.log(result);
    return result
}

function getStartDay(daysMeetingStr, classesStartReccuringDate) {
    // Needs to get the start day by checking which day is nearest to the classesStartReccuringDate
    // S M T W T F S

    //Loop through the days in the daysMeetingStrArr to check if they are on the classesStartReccuringDate or after it
    //if one of them is then pick that one
    //if not pick the first day in the list

    var daysMeetingStrArr = daysMeetingStr.split("/");

    for (var i = 0; i < daysMeetingStrArr.length; i++) {
        console.log(daysMeetingStrArr[i]);
        var meetingDay = strToDayOfWeek.get(daysMeetingStrArr[i]);
        var reccuringStartDay = classesStartReccuringDate.getDay();
        if (reccuringStartDay <= meetingDay) {
            return meetingDay;
        }
    }

    return strToDayOfWeek.get(daysMeetingStrArr[0]);
}

function getNextDateOfDayFromDate(startingDate, dayOfWeek) { //Bug that disallows for classes to start on the starting day given
    var result = startingDate;
    var currentDay = result.getDay(); // this is a Date object
    var targetDay = dayOfWeek; // this is an number
    var daysToAdd = targetDay - currentDay; 
    if (currentDay > targetDay) {
        daysToAdd += 7;
    }
    result = addDays(result,daysToAdd);
    while (result.getDay() != dayOfWeek) {
      result = addDays(result,1);
    }
    return result;
}
// "Instructor - Ryan Tsang\\nInstructional Format - Lecture\\nDelivery Mode - In-Person (Howe 102)\\n---\\nEmail - rtsang1@stevens.edu\\nPhone - 12012165455\\nInstructor Position - Teaching Assistant Professor\\nDepartment - Engineering and Science\\, Computer Science\\nOffice - Gateway Center S247\\n---"
// "Wesley J. Howe Center\\, 1 Castle Point Terrace\\, Hoboken\\, NJ 07030\\, USA"

// Append an event to the ics string

// startTime: HH:mm aa taken in as EST 
// endTime: HH:mm aa
function makeEvent(eventName, location, description, recurrence, startTime, endTime, date) {
    // BEGIN:VEVENT
    // DTSTAMP:20260108T223456Z
    // DTSTART:20260121T100000
    // DTEND:20260121T105000
    // SUMMARY:CS 492-A - Operating Systems
    // UID:89e8365a-392f-4c93-9aed-891b644f3b59
    // DESCRIPTION:Instructor - Ryan Tsang\nInstructional Format - Lecture\nDeli
    // very Mode - In-Person (Howe 102)\n---\nEmail - rtsang1@stevens.edu\nPhon
    // e - 12012165455\nInstructor Position - Teaching Assistant Professor\nDep
    // artment - Engineering and Science\, Computer Science\nOffice - Gateway C
    // enter S247\n---
    // LOCATION:Wesley J. Howe Center\, 1 Castle Point Terrace\, Hoboken\, NJ 07
    // 030\, USA
    // RRULE:FREQ=WEEKLY;WKST=SU;UNTIL=20260518T000000Z;BYDAY=MO,WE,FR
    // END:VEVENT
    // console.log(startTime);
    var currentTime = new Date();
    var eventString = ""
    eventString += "BEGIN:VEVENT\n"
    eventString += "DTSTAMP:" + getFormatTimeAndDateFromDOUTC(currentTime) + "\n"
    eventString += "DTSTART:" + getYearMonthDayStr(date) + "T" + getFormatTime24(startTime) + "00" + "\n";
    eventString += "DTEND:" + getYearMonthDayStr(date) + "T" + getFormatTime24(endTime) + "00" + "\n";
    eventString += "SUMMARY:" + eventName + "\n"
    eventString += "DESCRIPTION:" + description + "\n"
    eventString += "LOCATION:" + location + "\n"
    eventString += "RRULE:" + recurrence + "\n";// "FREQ=WEEKLY;WKST=SU;UNTIL=20260518T000000Z;BYDAY=MO,WE,FR"
    eventString += "END:VEVENT\n"
    return eventString
}

function getDatesFromRow(sheet, row) {
    // var result = ["1/6/25", "1/9/25"]
    // console.log("Sheet: ")
    // console.log(sheet)
    // console.log("Row: ")
    // console.log(row)

    // console.log(sheet['M'+(row+1).toString()]['w'])
    // console.log(sheet['N'+(row+1).toString()]['w'])


    return [sheet['M'+(row+1).toString()]['w'], sheet['N'+(row+1).toString()]['w']]
}

function getAddressFromRaw(raw) {
    var buildingName = "";
    for (var i = 0; i < raw.length; i++) {
        if (raw[raw.length-1-i] == " ") {
            buildingName = raw.substring(0, raw.length-1-i);
            console.log(buildingName);
            break;
        }
    }
    
    return (shortBuildingToAddress.has(buildingName)) ? shortBuildingToAddress.get(buildingName) : buildingName
}

function cleanUpListedData(eN, descript) {
    return "\n# " + eN + "\n---\n" + descript.replaceAll("\\n", "\n");
}

function processFileInput(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        // Get the binary data

        // Convert the data to a workbook

        // Get the first sheet

        // Convert the sheet to JSON

        // Reset Vars
        accomendationScheduleString = "";
        classBreakDownString = "";
        ics = "";


        // Do something with the JSON data
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' }); // WTF: true
        // Get the array of sheet names
        const sheetNames = workbook.SheetNames;

        // Log the sheet names
        console.log('Sheet names:', sheetNames);

        // Process the workbook (e.g., convert to JSON)
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        //const jsonData = XLSX.utils.sheet_to_json(worksheet);
        let jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1, raw: 1, cellText: true}); // getting somewhere // header: 1, defval: "" raw: true
        console.log(workbook);
        console.log(jsonData);
        console.log("Onload has run");
        // There are two formats that you got to be able to handle:

        // Format 1:

        // View My Courses
        // Calendar View
        // Edit Registration
        // My Enrolled Courses

        // Format 2:

        // My Enrolled Courses


        // Extra Detail: check for Withdraw vs Drop

        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        var startingIndex = 3
        if (jsonData[0][0] == "View My Courses") {
            console.log("Format 1!");
            startingIndex = 6;
        } else {
            console.log("Format 2!");
        }

        console.log(jsonData[startingIndex-1][2]);

        let versionWithdraw = false;
        if (jsonData[startingIndex-1][2] == "Withdraw") { // Covers for the extra gap of the extra row
            console.log("Withdraw Version");
            versionWithdraw = true;
        } else {
            console.log("Swap Version");
            versionWithdraw = false;
        }


        ics = "BEGIN:VCALENDAR\n";

        // Parsing of data begins
        // Name And Semester Type Parsing


        var firstEntry = jsonData[startingIndex][0].split(" - ");
        if (firstEntry.length < 7) {
            alert("Different first format then expected: canceling parsing!");
            return;
        }
        console.log(firstEntry);

        
        namePerson = firstEntry[0];
        icsFileName = firstEntry[6];


        for (var classIndex = startingIndex; classIndex < jsonData.length && jsonData[classIndex][0] != " " && jsonData[classIndex][0] != "Enrolled Units"; classIndex++) {
            
            console.log(jsonData[classIndex]);
            console.log(firstSheet);
            console.log(firstSheet['N'+(classIndex+1).toString()]);
            if (versionWithdraw) {
                jsonData[classIndex].splice(2, 0, null);
                jsonData[classIndex][12] = firstSheet['L'+(classIndex+1).toString()]['w'];
                jsonData[classIndex][13] = firstSheet['M'+(classIndex+1).toString()]['w'];
            } else {
                jsonData[classIndex][12] = firstSheet['M'+(classIndex+1).toString()]['w'];
                jsonData[classIndex][13] = firstSheet['N'+(classIndex+1).toString()]['w'];
            }
            
            
            console.log(jsonData[classIndex]); // After dates as strings have been reinstated

            // Start Day
            const startDay = dayFromStringParser(jsonData[classIndex][12]);
            console.log(startDay);
            console.log(startDay.getDay());
            // Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saterday = 6
            
            // End Day
            const endDay = dayFromStringParser(jsonData[classIndex][13]);
            console.log(endDay);
            console.log(endDay.getDay());

            var eventName = jsonData[classIndex][6];
            var address = "";
            var description = "";
            var recurrence = "";
            var startTime = "";
            var endTime = "";

            // Location String Validation, check if it looks like how it's supposed to look

            // It can look like any of these
            // 10: "Tuesday/Thursday | 9:30 AM - 10:45 AM | Edwin A. Stevens 214\n\nTuesday | 2:30 PM - 3:45 PM | Edwin A. Stevens 224"
            // 10: "Tuesday/Thursday | 9:30 AM - 10:45 AM | Edwin A. Stevens 214"
            // 10: "| Webcampus"

            console.log(jsonData[classIndex][10]);
            // Counting the number of bars to determine the type of string that is going to be parsed 
            var numOfBar = 0 
            if (jsonData[classIndex][10] != undefined) {
                for (const char of jsonData[classIndex][10]) {
                    //console.log(char);
                    if (char == '|') {
                        numOfBar += 1
                    }
                }
            }
            console.log(numOfBar);


            //         Instructor - Ryan Tsang\nInstructional Format - Lecture\nDeli
            //  very Mode - In-Person (Howe 102)\n---\nEmail - rtsang1@stevens.edu\nPhon
            //  e - 12012165455\nInstructor Position - Teaching Assistant Professor\nDep
            //  artment - Engineering and Science\, Computer Science\nOffice - Gateway C
            //  enter S247\n---
            var finalDescription = ""
            if (jsonData[classIndex][11] != " ") { // Instructor
                description += "Instructor - " + jsonData[classIndex][11];
                // Additional Instructor Info, happens if there is info to be had on the instructor
                let instructorName = jsonData[classIndex][11];
                if (facultyMap.has(instructorName)) { 
                    var facultyEntry = facultyMap.get(instructorName);
                    console.log(facultyEntry);
                    //  \n---\nEmail - rtsang1@stevens.edu\nPhon
                    //  e - 12012165455\nInstructor Position - Teaching Assistant Professor\nDep
                    //  artment - Engineering and Science\, Computer Science\nOffice - Gateway C
                    //  enter S247\n---
                    let email = facultyEntry[0];

                    finalDescription += "---";
                    finalDescription += "\\nEmail - " + email;
                    finalDescription += "\\nPhone - " + facultyEntry[3];
                    finalDescription += "\\nInstructor Position - " + facultyEntry[1];
                    finalDescription += "\\nDepartment - " + facultyEntry[5];
                    finalDescription += "\\nOffice - " + facultyEntry[4];
                    finalDescription += "\\n---"
                    // Add commas for proper formatting of the ICS file
                    finalDescription = finalDescription.replaceAll(",", "\\,");

                    // Accomendation Scheduling Section
                    // ["CS 496", "A"]
                    let classCodeInfo = eventName.split(" - ")[0].split("-");
                    accomendationScheduleString += classCodeInfo[0] + " | "
                                                +  classCodeInfo[1] + " | "
                                                +  instructorName + " | "
                                                +  email + "\n";
                    //eventName.split(" - ")[0].split("-")[0] + " | " + eventName.split(" - ")[0].split("-")[1] + " | " + instructorCell + " | " + instructor.getEmail() + "\n";
                    // var classBreakDownString = "";

                }
            } else {
                description += "Instructor - ?";
            }
            description += "\\n"
            description += "Instructional Format - " + jsonData[classIndex][8];
            description += "\\n"
            description += "Delivery Mode - " + jsonData[classIndex][9];
            
            

            // console.log("Tuesday/Thursday | 9:30 AM - 10:45 AM |".split(" | "));
            // console.log("Tuesday/Thursday | 9:30 AM - 10:45 AM |".substring(0, "Tuesday/Thursday | 9:30 AM - 10:45 AM |".length-2));

            // Accomendation String Processing and full scheduling string

            const checkbox = document.getElementById('addressOverride');

            const isChecked = checkbox.checked;

            console.log(checkbox);

            
            if (numOfBar == 4) {
                console.log("OnCampus Class Multi Event (2)");
                var eventSplit = jsonData[classIndex][10].split("\n\n");
                for (var g = 0; g < eventSplit.length; g++) {
                    var additionDescriptionNeeded = true;
                    var additionDescription = "";
                    // clean up the end for parsing
                    if (eventSplit[g].substring(eventSplit[g].length-2) == " |") {
                        eventSplit[g] = eventSplit[g].substring(0, eventSplit[g].length-2);
                        additionDescriptionNeeded = false;
                    }
                    var eventArray = eventSplit[g].split(" | ");
                    if (additionDescriptionNeeded) {
                        address = isChecked ? eventArray[2] : getAddressFromRaw(eventArray[2]);
                        additionDescription += " (" + eventArray[2] + ")\\n";
                    }
                    recurrence = makeRecurrenceString(endDay, eventArray[0]);
                    var times = eventArray[1].split(" - ");
                    startTime = times[0];
                    endTime = times[1];
                    var date = getNextDateOfDayFromDate(startDay, getStartDay(eventArray[0], startDay));
                    classBreakDownString += cleanUpListedData(eventName, description + additionDescription + finalDescription);
                    ics += makeEvent(eventName, address, description + additionDescription + finalDescription, recurrence, startTime, endTime, date);
                }
            } else if (numOfBar == 2) { // Normal OnCampus Class
                console.log("OnCampus Class");
                var additionDescriptionNeeded = true;
                var additionDescription = "";
                // clean up the end for parsing
                if (jsonData[classIndex][10].substring(jsonData[classIndex][10].length-2) == " |") {
                    jsonData[classIndex][10] = jsonData[classIndex][10].substring(0, jsonData[classIndex][10].length-2)
                    additionDescriptionNeeded = false;
                }
                var eventArray = jsonData[classIndex][10].split(" | ");
                if (additionDescriptionNeeded) {
                    address = isChecked ? eventArray[2] : getAddressFromRaw(eventArray[2]);
                    additionDescription += " (" + eventArray[2] + ")\\n";
                }
                recurrence = makeRecurrenceString(endDay, eventArray[0]);
                var times = eventArray[1].split(" - ");
                startTime = times[0];
                endTime = times[1];
                var date = getNextDateOfDayFromDate(startDay, getStartDay(eventArray[0], startDay));
                classBreakDownString += cleanUpListedData(eventName, description + additionDescription + finalDescription);
                ics += makeEvent(eventName, address, description + additionDescription + finalDescription, recurrence, startTime, endTime, date);
            } else if (numOfBar == 1 || numOfBar == 0) { // Webcampus
                console.log("Webcampus");
                address = "Webcampus";
                startTime = "";
                endTime = "";
                classBreakDownString += cleanUpListedData(eventName, description + finalDescription);
                continue;
            } else { // Unexpected Behavior (format change likely)
                alert("Unexpected Behavior (format change likely)");
                console.log(jsonData[classIndex]);
                // Exit immediately
                return;
            }



            //makeEvent(eventName, location, description, recurrence, startDateTime, endDateTime)
            

            // Ending condition: "Enrolled Units" in the first column or the array just runs out of run way


            // As of writing this is how I expect the data in each class row
            // Array(14) [ "Jane Doe - Chemical Engineering Program/Undergraduate (B.E.) - 09/01/2022 - Active - CHE 352 - Chem Operations - 2025 Fall Semester", "CHE 352 - Chem Operations", <2 empty slots>, 3, "Graded", "CHE 352-A - Chem Operations", "Registered", "Lecture", "In-Person", … ]
            // 0: "Jane Doe - Chemical Engineering Program/Undergraduate (B.E.) - 09/01/2022 - Active - CHE 352 - Chem Operations - 2025 Fall Semester"
            // 1: "CHE 352 - Chem Operations"
            // 2:
            // 3:
            // 4: 3
            // 5: "Graded"
            // 6: "CHE 352-A - Chem Operations"
            // 7: "Registered"
            // 8: "Lecture"
            // 9: "In-Person"
            // 10: "Tuesday/Thursday | 4:30 AM - 5:45 AM | Edwin A. Stevens 214"
            // 11: "Steven Edwin"
            // 12: "9/2/22"
            // 13: "12/22/22"

        }
        ics += "END:VCALENDAR";
    };

    reader.readAsArrayBuffer(file);
}

function downloadICSFile() {
    //alert(selectedFile)
    if (ics == "" || selectedFile == null) {
        return
    }
    //const fileContent = "This is the content of the file."; // Or the actual File object
    const blob = new Blob([ics], { type: "text/plain" }); // Adjust type as needed
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const nameInput = document.getElementById('nameInput');
    // console.log(nameInput.value);
    if (nameInput.value != "") {
        namePerson = nameInput.value; 
        console.log(namePerson);
    }
    a.download = namePerson + " " + icsFileName + ".ics"; // Desired filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function downloadBreakDownFile() {
    //alert(selectedFile)
    if (classBreakDownString == "" || selectedFile == null) {
        return
    }
    //const fileContent = "This is the content of the file."; // Or the actual File object
    const blob = new Blob([classBreakDownString], { type: "text/plain" }); // Adjust type as needed
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const nameInput = document.getElementById('nameInput');
    // console.log(nameInput.value);
    if (nameInput.value != "") {
        namePerson = nameInput.value; 
        console.log(namePerson);
    }
    a.download = namePerson + " " + icsFileName + " BreakDown.txt"; // Desired filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function downloadAccomendationFile() {
    //alert(selectedFile)
    if (accomendationScheduleString == "" || selectedFile == null) {
        return
    }
    //const fileContent = "This is the content of the file."; // Or the actual File object
    const blob = new Blob([accomendationScheduleString], { type: "text/plain" }); // Adjust type as needed
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const nameInput = document.getElementById('nameInput');
    // console.log(nameInput.value);
    if (nameInput.value != "") {
        namePerson = nameInput.value; 
        console.log(namePerson);
    }
    a.download = namePerson + " " + icsFileName + " Accomendation.txt"; // Desired filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

const fileInput = document.getElementById('fileInput');
let selectedFile = null;

fileInput.addEventListener('change', (event) => {
        console.log("changed file");
        selectedFile = event.target.files[0];
        processFileInput(selectedFile)
        // Now you can work with the selectedFiles
});

const convertButton = document.getElementById('convertButton');
convertButton.addEventListener('click', function() {
        // Code to execute when the button is clicked
        //alert('Button clicked!');
        if (selectedFile == null) {
            alert("Please select your file first!");
            return;
        }
        // console.log("Button pressed");
        // console.log(selectedFile.name);
        downloadICSFile();
});
const accomendationButton = document.getElementById('accomendationsButton');
accomendationButton.addEventListener('click', function() {
        // Code to execute when the button is clicked
        //alert('Button clicked!');
        if (selectedFile == null) {
            alert("Please select your file first!");
            return;
        }
        // console.log("Button pressed");
        // console.log(selectedFile.name);
        downloadAccomendationFile();
});

const breakDownButton = document.getElementById('notesOfClassesButton');
breakDownButton.addEventListener('click', function() {
        // Code to execute when the button is clicked
        //alert('Button clicked!');
        if (selectedFile == null) {
            alert("Please select your file first!");
            return;
        }
        // console.log("Button pressed");
        // console.log(selectedFile.name);
        downloadBreakDownFile();
});







