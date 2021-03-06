//Scripts about the "add a baby" dialog
var today = new Date();
var todayDMY = ("00" + today.getDate()).slice(-2)+"/"+("00" + today.getMonth()).slice(-2)+"/"+today.getFullYear();
function updateDataAndGraph(){
    var currentName = getName();
    graph.setPoints();
    graph.setCurrrentDataWeight();
    graph.title = currentName;
    graph.redraw();
    graph.update();
    graph.setTitle();
}
//Track baby selected in dropdown
jQuery(document).on("change", "#dropdown", function(e) {
    //deselect any possible circle
    deselectCircle(1);
    //Update the lines, circles, title
    var currentName = this.options[e.target.selectedIndex].text;
    updateDataAndGraph();
    //Update the minDate in date picker
    updateMinDate("#datep");
});
//Create a baby instance, for testing purposes
var baby = new Baby();
/*baby.AddBaby({"name":"Alice", "gender":2, "birthdate": "01/07/2015"});
baby.AddBaby({"name":"Nijntje", "gender":1, "birthdate": "01/01/2015"});
*/
var names = []
//Functions for the dialog
jQuery(function() {
    jQuery("#dialog").dialog({
      autoOpen: false,
      show: { effect: "blind", duration: 500 },
      hide: { effect: "blind", duration: 500 },
      buttons: {
        "Add baby" : {
        	text : "Add baby",
        	id : "dialog_AddBaby",
        	click : function() {
          		addToDropdown(); 
              autocomplete();
              enableSelection();
          		jQuery( this ).dialog("close");          
        	}
        },
        Cancel: function() {
            jQuery( this ).dialog("close");
          },
        "Delete this baby" : {
        	text : "Delete this baby",
        	disabled : true,
        	id : "dialog_DelBaby",
        	click : function() {
          var text = jQuery("#inputfordropdown").val();
          removeBaby(text); 
          autocomplete();
          jQuery( this ).dialog("close");
        }
      }        
      }
    });
    //Fire up the dialog 
    jQuery("#editBabyButton").click(function() {
      jQuery("#dialog").dialog("open");
    });
    //Behavior when dropdown changes
    jQuery(document).on("change", "#inputfordropdown", function(e) {
    	var names = baby.Name.toString().split(",");
    	var text = jQuery("#inputfordropdown").val();
    	if (names.indexOf(text) > -1) {
    		//Load the birthdate and gender
    		var ind = baby.Name.indexOf(text);
    		jQuery("#birthdatep").val(baby.BirthDate[ind]);
    		var gender = (baby.Gender[ind] == 1 ? "Male" : "Female");
    		jQuery("#genderinput").val(gender);
    		//Disable birthdatep and genderinput
    		document.getElementById('birthdatep').disabled = true;
    		document.getElementById('genderinput').disabled = true;    		
    		//"enable Delete this baby"
    		jQuery(".ui-dialog-buttonpane button:contains('Delete')").button("enable");
    	} else {
    		//enable birthdatep 
    		document.getElementById('birthdatep').disabled = false;
    		document.getElementById('genderinput').disabled = false;    
    		//"disable Delete this baby"
    		jQuery(".ui-dialog-buttonpane button:contains('Delete')").button("disable");
    	}
    });    
});
//Autocomplete baby name input
function autocomplete() {
    jQuery(function() {
        var names = baby.Name.toString().split(",");
        jQuery("#inputfordropdown").autocomplete({
          source: names
        }); //testing SVC git
      });
     }
//Helper functions related to the dialog
function emptyDropdown(){
  //empty() removes all child nodes
  jQuery("#dropdown").empty();
}
function populateDropdown(array){
  //append children
  jQuery.each(array, function(val, text) {

      jQuery('#dropdown').append(jQuery('<option></option>').val(text).html(text).addClass("dropdownBaby") )
    });
}
function removeBaby(name){
  var success = baby.RemoveBabyByName(name);
  if (success == false) {
    alert(name+" was not found");
  } else {
    var conf = confirm("Do you really want to proceed with removing this baby and all its data?");
    if (conf){
      emptyDropdown();
      if (baby.Name.length > 0) {
        populateDropdown(baby.Name);
        //enable Selections
        enableSelection(true);
      } else {
        //disable Selections if baby is empty
        enableSelection(false);
      }
    }
  }
}
function areInputsValid(prompt){
  var text = jQuery("#inputfordropdown").val();
  //We will check whether the name in "text" is already present in the baby instance
  var existing = getExistingElements();
  var message = "";
  if (existing.indexOf(text) > -1) {
    message = "This name already exists";
  }
  else if (text == "") {
    message = "The name cannot be empty"; 
  }
  else if (text == "Name") {
    message = "Please select a name for your child"; 
  }
  //Check if the gender was selected
  else if (jQuery("#genderinput").val() === null) {
    message = "Please select a gender for your child";
  }
  //Check if the birthdate was selected
  else if (jQuery("#birthdatep").val() == "Birthdate") {
    message = "Please select a birthdate for your child";
  }
  //Prompt the problem
  if (message !== "") {
    if (prompt) {
      //customAlert(message,3000); //too bad, customAlert is asynchronous and the dialog disappears
      alert(message);
    }
    return false;
  }
  return true;
}
//Add all existing babies to the dropdown 
function addToDropdown(){
  if (areInputsValid(true)){
    var text = jQuery("#inputfordropdown").val();  
    var gender = jQuery("#genderinput").val();
    if (gender == "Female") {
      gender = 2;
    } else if (gender == "Male") {
      gender = 1;
    }
    var birthdate = jQuery("#birthdatep").val();
    //Add to baby instance
    baby.AddBaby({"name": text, "birthdate": birthdate, "gender": gender})
    //Switch dropdown in UI to new baby 
    emptyDropdown();
    populateDropdown(baby.Name);
    jQuery("select option[value='"+text+"']").attr("selected","selected");
    //Replot
    updateDataAndGraph();
    //Update minDate in #datep
    updateMinDate("#datep");
  } 
}
function getExistingElements(){
  var elem = new Array();
  jQuery(".dropdownBaby").each(
    function(index) { 
      elem.push(jQuery( this ).text());
  });
    return elem;
}
//Get the baby's name from the dropdown
function getName(){
  var value = jQuery("#dropdown").val();
  if (value == null) {
    return "Female baby";
  }
  return value
}
//Get the baby's gender from the dropdown
function getGender(){
  var name = getName();
  if (baby.Gender.length == 0) return 0;
  var index = baby.Name.indexOf(name);
  var gender = baby.Gender[index]
  // solved problem: when I add a baby using the dropdown I get Male/Female, not 1/2.
  if (gender == "Female") {
    gender = 2;
  } else if (gender == "Male") {
    gender = 1
  }
  return gender;
}
//Get the baby's BirthDate from the dropdown as string (e.g. 27/11/2015)
function getBirthdate(){
  var name = jQuery("#dropdown").val();
  if (name == null) {
    return todayDMY;
  }
  var index = baby.Name.indexOf(name);
  return baby.BirthDate[index];
}
//Update minDate for e.g. #datep
function updateMinDate(selector){
    var birthdateDMY = getBirthdate().split("/");
    jQuery(selector).datepicker("option", "minDate", new Date(birthdateDMY[2], birthdateDMY[1] - 1, birthdateDMY[0]) );
}
//At startup populate the dropdown menu
populateDropdown(baby.Name);





//Scripts about adding and plotting the data
//disable weight spinner, date and add weight button  
enableSelection();
//Set date picker to today
if (jQuery("#datep").val() == "") {
  jQuery("#datep").val(todayDMY);
}
//Set birthdate picker to yesterday 
if (jQuery("#birthdatep").val() == "") {
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  var yesterdayDMY = ("00" + yesterday.getDate()).slice(-2)+"/"+("00" + yesterday.getMonth()).slice(-2)+"/"+yesterday.getFullYear()
  jQuery("#birthdatep").val(yesterdayDMY);
}
//Define behaviour of date pickers and spinner
var birthdateDMY = getBirthdate().split("/");
jQuery(function() {   
  jQuery("#datep").datepicker({
    minDate: (new Date(birthdateDMY[2], birthdateDMY[1] - 1, birthdateDMY[0])),
    maxDate: 0, numberOfMonths: 2, dateFormat: "dd/mm/yy"
  });
  jQuery("#birthdatep").datepicker({
    maxDate: 0, numberOfMonths: 2, dateFormat: "dd/mm/yy"
  });
jQuery.widget( "ui.pcntspinner", jQuery.ui.spinner, {
    _format: function( value ) { 
        var suffix = this.options.suffix;
        return value +" "+ suffix; 
    },    
    _parse: function(value) { return parseFloat(value); }
});
jQuery("#weightSpinner").pcntspinner({ 
    min: 1,
    suffix:'Kg',
    max: 100,
    step: .1
    //disabled: true
    });

});

//Custom alert
jQuery(function() {
    jQuery("#custom-alert").dialog({
      id: "custom",
      buttons: {
        "Close" : {
        	text : "Close",
        	id : "dialog_AddBaby",
        	click : function() {       
          		jQuery( this ).dialog("close");          
        	}
        }
      },
      text: "",
      autoOpen: false,
      width:'auto',
      position: { my: 'top', at: 'top+350' },
      show: { effect: "fade", duration: 600 },
      hide: { effect: "fade", duration: 1200 }
    });
});
function customAlert(meassage,hideTimeout) {
   jQuery("#custom-alert").text(meassage);
   jQuery("#custom-alert").dialog("open");
    /* //display the box
  var customAlert = document.getElementById("custom-alert-1");
  customAlert.style.visibility = 'visible';
  */
   //set up a timer to hide it, a.k.a a setTimeout()
  setTimeout(function() {
    jQuery("#custom-alert").dialog("close");
    return true;
  }, hideTimeout)
}   

								//format Date input: height!!
//AddWeight: store and plot data
jQuery(function() {
    jQuery("#AddWeight").click(function() {
        //First remove circle selection, if any
        deselectCircle(1);
        if (jQuery(weightSpinner).pcntspinner("isValid") == false) {
          alert("Please insert a correct weight");
          return False;
        }
        var index = baby.Name.indexOf(getName()); 
		    var weight = jQuery(weightSpinner).pcntspinner( "value" );
        var dateDMY = jQuery(datep).val();
        if ((baby.Data[index].Date.indexOf(dateDMY) > -1) && (baby.Data[index].Weight.indexOf(weight) > -1)) {
          customAlert("This point already exists",1800);
          return;
        }
        var birthdateYMD = new Date(dateToYMD(getBirthdate()));
        var date = new Date(dateToYMD(dateDMY));
        var days = Math.abs(date - birthdateYMD) / 3600 / 24000;
        //var index = baby.GetIndex(getName());
        
        var obj = {
          	"Date" : dateDMY,
          	"Weeks" : days / 7,
          	"Weight" : weight
        };
        //Append data to baby
        baby.Data[index].Append(obj);
        //Remove plotted lines only if user has changed the child's gender      
        if (getGender() != getPlottedGender()) {
          graph.removePathsInSVG();
          graph.plotLines();
        }
        graph.update();
        return true;
        });    
      //jQuery("button").button();  format for buttons?
 });
//Delete point button
jQuery(function() {
    jQuery("#DeleteMeasure").click(function() {
      	var deleted = deleteWeight(graph.selectCircle.id);
      	if (deleted) {
        	deselectCircle(1);
        	graph.update();
        	return true;
      	}
    return false;
    })
});

///Helper functions
function enableSelection(enable) {
  if (typeof enable == "undefined") {
    //console.log("enable is undefined");
    (baby.Name.length > 0) ? enable = true : enable = false;  
    //console.log("enableSelection(" + enable + ")");
  }
  
  //Toggle the weight spinner 
  var spinner = jQuery( "#weightSpinner" ).spinner();
  var datep = jQuery( "#datep" ).datepicker();
  if (enable) {
    spinner.spinner( "enable" );
    jQuery( "#datep" ).datepicker( "option", "disabled", false);
    jQuery('#AddWeight').prop('disabled', false);  
  } else {
    spinner.spinner( "disable" );
    jQuery( "#datep" ).datepicker( "option", "disabled", true);
    jQuery('#AddWeight').prop('disabled', true);
  }
  //NB: "#DeleteMeasure" should be all set
}
 function deselectCircle(nullify) {
    if (graph.selectCircle) {
        document.getElementById(graph.selectCircle.id).setAttribute("r",6);
        if (nullify) {
          graph.selectCircle = null;
          document.getElementById('DeleteMeasure').disabled = true;
        }
    }
}
//Convert date string from DMY (dd/mm/yyyy) to YMD string (yyyy/mm/dd)
function dateToYMD(dmy) {
  return dmy.substring(6,10) + "/" + dmy.substring(3,5) + "/" + dmy.substring(0,2)
 };
//Convert date string from DMY (dd/mm/yyyy) to YMD string (yyyy/mm/dd)
function DMYToDate(dmy) {
	return date.parse(dmy.substring(3,5) + "/" + dmy.substring(0,2) + "/" + dmy.substring(6,10))	
  };

//Clear the graph from lines
function removePathsInSVG() {
   //d3.select("svg").selectAll("*").remove(); //all children
   d3.selectAll(".pathArea").remove(); //
  }
//Get the currently plotted gender: 1,2,-1 for male/female/unknown
function getPlottedGender() {
  var stroke = jQuery('[id*="sigma"]').css("stroke");
  if (stroke == "rgb(0, 255, 255)") {
    return 1; 
  } else if (stroke == "rgb(255, 0, 255)") {
    return 2;
  } else {
    throw "getPlottedGender: cannot determine the plotted gender. color in style>stroke not recognized";
    return -1;
  } 
}
function deleteWeight(id){
	var index = id.split("_").pop();
	//var babyindex = baby.GetIndex();
  var babyindex = baby.Name.indexOf(getName());
	var string = "Weight was "+baby.Data[babyindex].Weight[index]+"Kg on "+baby.Data[babyindex].Date[index]
	var conf = confirm("Do you really want to remove this point from the data?\n"+string);
	if (conf){
		baby.Data[babyindex].Date.splice(index, 1);
		baby.Data[babyindex].Weeks.splice(index, 1);
		baby.Data[babyindex].Weight.splice(index, 1);
		//Update the circles and the scatterplot
		graph.setCurrrentDataWeight();
    return true;
	}
  return false;
}





/*
var DaysForTest = function(babyBirthdate, date){
	var birthdateYMD = new Date(dateToYMD(baby.BirthDate[babyBirthdate]));
	var date = new Date(dateToYMD(date));
	var days = Math.abs(date - birthdateYMD) / 3600 / 24000
	return days;
}
baby.Data[0].Append({"Date": "01/08/2015",
	"Weeks" : DaysForTest(0,"01/08/2015") / 7, "Weight" : 6});

baby.Data[0].Append({"Date": "01/08/2015",
	"Weeks" : DaysForTest(0,"30/08/2015") / 7, "Weight" : 4});
baby.Data[1].Append({"Date": "10/08/2014", 
	"Weeks" : DaysForTest(1,"01/08/2015") / 7, "Weight" : 5});
*/

//Start plot
var weiBoy = [];
var weiGirl = [];

d3.tsv("weianthro.txt", 
  //This function defines how "data" below will look like 
  function(d) {
    return {
    gender: +d.sex,
    age: +d.age / 7,   //weeks!
      l: +d.l,
      m: +d.m,
      s: +d.s,
    };
  },function(error, data) {    
      data.forEach(function(d, i) {
        data[i].gender == 1 ? weiBoy.push(d) : weiGirl.push(d);
        });

      graph = new SimpleGraph("chart1", {
          "xmin": 0, "xmax": 200,
          "ymin": 0, "ymax": 20, 
          "pointsBoy": weiBoy,
          "pointsGirl": weiGirl,
          "xlabel": "Weeks",
          "ylabel": "Weight [Kg]",
          "maxzoom": 2  
      });
    }
);   
