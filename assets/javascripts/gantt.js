/**
 * Created with JetBrains RubyMine.
 * User: max
 * Date: 10.10.13
 * Time: 16:38
 * To change this template use File | Settings | File Templates.
 */


$(document).on('click', '.gantt-zoom-tasks-inputs input[type="radio"]', function(){

    var node = this
    switch(node.value){
        case "week":
            gantt.config.scale_unit = "day";
            gantt.config.date_scale = "%d %M";

            gantt.config.scale_height = 60;
            gantt.config.subscales = [
                {unit:"hour", step:6, date:"%H"}
            ];
            break;
        case "trplweek":
            gantt.config.scale_unit = "day";
            gantt.config.date_scale = "%d %M";
            gantt.config.subscales = [ ];
            gantt.config.scale_height = 35;
            break;
        case "month":
            gantt.config.scale_unit = "week";
            gantt.config.date_scale = "Week #%W";
            gantt.config.subscales = [
                {unit:"day", step:1, date:"%D"}
            ];

            gantt.config.scale_height = 60;
            break;
        case "year":
            gantt.config.scale_unit = "month";
            gantt.config.date_scale = "%M";
            gantt.config.scale_height = 60;
            gantt.config.subscales = [
                {unit:"week", step:1, date:"#%W"}
            ];
            break;
        case "years":
            gantt.config.scale_unit = "year";
            gantt.config.date_scale = "%Y";
            gantt.config.scale_height = 60;
            gantt.config.subscales = [
                {unit:"month", step:1, date:"#%M"}
            ];
            break;
    }
    gantt.render();
})

$(document).ready(function(){
    var tasks = gon.data_gantt
    gantt.attachEvent("onBeforeTaskDisplay", function(id, task){
        if (gantt_filter)
            if (task.priority != gantt_filter)
                return false;

        return true;
    });

    gantt.templates.scale_cell_class = function(date){
        var today = new Date()
        if(date.getDay()==0||date.getDay()==6){
            if (date <= today){
                return "weekend_past_simple"
            } else {
                return "weekend" ;
            }
        } else{
            if (date <= today){
                return "past_simple"
            }
        }
    };
    gantt.templates.task_cell_class = function(item,date){
        var today = new Date()
        if(date.getDay()==0||date.getDay()==6){
            if (date <= today){
                return "weekend_past_simple"
            } else {
                return "weekend" ;
            }
        } else{
            if (date <= today){
                return "past_simple"
            }
        }
    };

    var gantt_filter = 0;
    function filter_tasks(node){
        gantt_filter = node.value;
        gantt.refreshData();
    }


    gantt.config.details_on_create = true;

    gantt.config.sort = true;

    console.log(tasks);
    gantt.templates.task_class = function(start, end, obj){
        if(obj.project){
            return "project"
        } else {
            return ""
        }
    }
    function modHeight(){
        var headHeight = 122;

        var sch = document.getElementById("gantt_here");
        sch.style.height = (tasks['data'].length * (gantt.config.scale_height+2))+'px'; //(parseInt(document.body.offsetHeight)-headHeight)+"px";
        //var contbox = document.getElementById("contbox");
        //contbox.style.width = (parseInt(document.body.offsetWidth)-300)+"px";

        gantt.setSizes();
    }

    gantt.init("gantt_here");
    modHeight();
    console.log(tasks["links"])
    gantt.parse(tasks);

})