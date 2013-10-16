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
                return "weekend past_simple"
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
            if (date < today){
                return "weekend past_simple"
            } else {
                if (date == today){
                    return "weekend splitter" ;
                } else {
                    return "weekend" ;
                }

            }
        } else{
            if (date < today){
                return "past_simple"
            } else{
                if (date == today){
                    return "splitter"
                }
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


    gantt.templates.task_class = function(start, end, obj){
        if(obj.project){
            return "project"
        } else {
            if (obj.version){
                return "version"
            } else {

              var statuses = ["new","in_progress", "solved", "callback", "closed", "rejected", "agreed", "canceled"]

              if (statuses[obj.status-1]){
                  return statuses[obj.status-1]+"_issue"
              }
            }
            return ""
        }
    }

    gantt.templates.rightside_text = function(start, end, task){
        return task.rightside_text;
    };

    gantt.templates.task_text=function(start, end, task){
        return '';
    };

    gantt.templates.progress_text=function(start, end, task){return parseInt(task.progress*10)*10+'%';};

    function modHeight(){
        var headHeight = 122;

        var sch = document.getElementById("gantt_here");
        sch.style.height = (tasks['data'].length * (gantt.config.scale_height+2))+'px'; //(parseInt(document.body.offsetHeight)-headHeight)+"px";
        //var contbox = document.getElementById("contbox");
        //contbox.style.width = (parseInt(document.body.offsetWidth)-300)+"px";
        //sch.style.height = (parseInt(document.body.offsetHeight)-headHeight)+"px";
        gantt.setSizes();
    }

    gantt.config.task_height = 14;
    gantt.config.row_height = 17;
    gantt.config.scale_height = 17;
    gantt.config.link_arrow_size = 8;
    gantt.config.columns=[
        {name:"text", label:"Задачи",  tree:true, width:'*' },
        {name: 'start_date', label: 'Дата начала', width: '60px'}
    ]

    gantt.templates.tooltip_text = function(start,end,task){
        return task.tooltip ? task.tooltip : task.text;
    };
    gantt.config.tooltip_timeout = 500;
    gantt.config.sort = true;
    gantt.config.drag_links = true;
    gantt.config.show_progress = true;
    gantt.config.drag_progress = false;
    gantt.config.details_on_dblclick = false;
    gantt.config.autofit = true;
    gantt.init("gantt_here");
    modHeight();
    gantt.parse(tasks)
    $( ".gantt_grid_head_text" ).resizable({ alsoResize: ".gantt_grid_data .gantt_row .gantt_cell", handles: "n, e" });
    //$( ".gantt_grid_head_start_date" ).resizable();
    //gantt.load('gantt.js');
    //$(".table").colResizable();
    //$.each(tasks["data"], function(i, val){
    //    gantt.addTask(val)
    //})

})