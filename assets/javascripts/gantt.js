/**
 * Created with JetBrains RubyMine.
 * User: max
 * Date: 10.10.13
 * Time: 16:38
 * To change this template use File | Settings | File Templates.
 */


function in_array (needle, haystack, argStrict) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: vlado houba
    // +   input by: Billy
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: true
    // *     example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'});
    // *     returns 2: false
    // *     example 3: in_array(1, ['1', '2', '3']);
    // *     returns 3: true
    // *     example 3: in_array(1, ['1', '2', '3'], false);
    // *     returns 3: true
    // *     example 4: in_array(1, ['1', '2', '3'], true);
    // *     returns 4: false
    var key = '',
        strict = !! argStrict;

    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }

    return false;
}


var scale_gantt = function(value){
    switch(value){
        /*case "week":
         gantt.config.scale_unit = "day";
         gantt.config.date_scale = "%d %M";

         gantt.config.scale_height = 60;
         gantt.config.subscales = [
         {unit:"hour", step:6, date:"%H"}
         ];
         break; */
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
}

$(document).on('click', '.gantt-zoom-tasks-inputs input[type="radio"]', function(){

    var node = this
    scale_gantt(node.value)
    gantt.render();
})

function simple_tooltip(target_items, name){
    $(target_items).each(function(i){
        $("body").append("<div class='"+name+"' id='"+name+i+"'><p>"+$(this).parent().html()+"</p></div>");
        var my_tooltip = $("#"+name+i);
        $(this).removeAttr("title").mouseover(function(){
            my_tooltip.css({display:"none"}).fadeIn(400);
        }).mousemove(function(kmouse){
                my_tooltip.css({left:kmouse.pageX+15, top:kmouse.pageY+15});
            }).mouseout(function(){
                my_tooltip.fadeOut(400);
            });
    });

}

function limitMoveLeft(task, limit){
    var dur = task.end_date - task.start_date;
    task.end_date = new Date(limit.end_date);
    task.start_date = new Date(+task.end_date - dur);
}
function limitMoveRight(task, limit){
    var dur = task.end_date - task.start_date;
    task.start_date = new Date(limit.start_date);
    task.end_date = new Date(+task.start_date + dur);
}

function limitResizeLeft(task, limit){
    task.end_date = new Date(limit.end_date);
}
function limitResizeRight(task, limit){
    task.start_date = new Date(limit.start_date)
}

function after_render_gantt(){
    simple_tooltip(".gantt_tree_icon.gantt_tree_avatar img","gantt_tree_tooltip");

}

$(document).ready(function(){

    /*$(document).on('click', '.check_column input[type="checkbox"]', function(){
        var uncheckeds = $('.check_column input:not(:checked)')
        var names = []
        uncheckeds.each(function(i, el){
            names.push($(el).attr('name').replace('columns[','').replace(']',''))
            //console.log()
            //console.log($(el).attr('name'))
        })
        hidden_columns = names;
        gantt.config.columns = []
        $.each(columns_hash, function(key, value) {
            if (! in_array(key, hidden_columns)){
                gantt.config.columns.push(value)
            }
        })
        //gantt.init("gantt_here");
        //gantt.render()
        //console.log(names)
        gantt._render_grid();
        gantt.render();

    }) */

    gantt.attachEvent("onBeforeTaskDisplay", function(id, task){
        if (gantt_filter)
            if (task.priority != gantt_filter)
                return false;

        return true;
    });

    gantt.templates.grid_file = function(item) {
        if (item.avatar){
            return "<div class='gantt_tree_icon gantt_tree_avatar'><img href='/people/"+item.assign_to+"' src='"+item.avatar+"'/></div>";

        } else {
            return "<div class='gantt_tree_icon gantt_file'></div>";
        }
    };

    gantt.templates.grid_folder = function(item) {
        if (item.avatar){
            return "<div class='gantt_tree_icon gantt_tree_avatar'><img href='/people/"+item.assign_to+"' src='"+item.avatar+"'/></div>";
        } else {
            if (item.project == 1){
                return "<div class='gantt_tree_icon gantt_folder_" +
                    (item.$open ? "open" : "closed") + "'></div>";
            } else {
                return "<div class='gantt_tree_icon gantt_file'></div>";
            }
        }

    };

    gantt.templates.scale_cell_class = function(date){
        var today = new Date()
        if((date.getDay()==0||date.getDay()==6) && $('.gantt-zoom-tasks-inputs input[type="radio"]:checked').val() == 'trplweek'){
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

    gantt.attachEvent("onBeforeTaskSelected", function(id,item){
        //return false
    })

    gantt.templates.task_cell_class = function(item,date){
        var today = new Date()
        if((date.getDay()==0||date.getDay()==6) && $('.gantt-zoom-tasks-inputs input[type="radio"]:checked' ).val() == 'trplweek'){
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


    //gantt.config.details_on_create = false;

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

    /*gantt.templates.rightside_text = function(start, end, task){
        return task.rightside_text;
    };*/

    gantt.templates.task_text=function(start, end, task){
        return '';
    };


    gantt.templates.progress_text=function(start, end, task){return parseInt(task.progress*10)*10+'%';};

    function modHeight(){
        var headHeight = 122;

        var sch = document.getElementById("gantt_here");

        sch.style.height = ((gantt._order.length+5) * (gantt.config.row_height)+gantt.config.scale_height)+'px'; //(parseInt(document.body.offsetHeight)-headHeight)+"px";
        //var contbox = document.getElementById("contbox");
        //contbox.style.width = (parseInt(document.body.offsetWidth)-300)+"px";
        //sch.style.height = (parseInt(document.body.offsetHeight)-headHeight)+"px";
        gantt.setSizes();
    }

    //gantt.config.scroll_size = 400;
    gantt.config.task_height = 16;
    gantt.config.row_height = 22;
    gantt.config.scale_height = 35;
    gantt.config.link_arrow_size = 8;



    gantt.config.columns = []

    //console.log(hidden_columns)

    $.each(columns_hash, function(key, value) {
        if (! in_array(key, hidden_columns)){
          gantt.config.columns.push(value)
        }
    })





    gantt.templates.tooltip_text = function(start,end,task){
        return task.tooltip ? task.tooltip : task.text;
    };
    gantt.config.tooltip_timeout = 500;

    gantt.config.drag_links = false;
    gantt.config.show_progress = true;
    gantt.config.drag_progress = false;
    gantt.config.details_on_dblclick = true;
    gantt.config.lightbox.sections = [
        {name:"time", height:72, type:"duration", map_to:"auto"}
    ]
    gantt.config.drag_lightbox = true;
    gantt.config.autofit = true;
    gantt.config.order_branch = true;
    //gantt.config.select_task  = false;
    scale_gantt('year')


    gantt.attachEvent("onScaleAdjusted", function(){
        after_render_gantt();
    })
    gantt.attachEvent("onLoadEnd", function(){
        //any custom logic here
        $('.gantt_loader').hide()
        $('#gantt_here').fadeIn(1000)
        modHeight();
        /*$( ".gantt_grid" ).resizable({handles: "e, w", resize: function(event, ui){
            var grid_width = $(this).outerWidth(true)
            var task_width = $('#gantt_here').outerWidth(true)-grid_width

            var col_start_date_width = $('#gantt_here .gantt_grid_scale div[column_id="start_date"]').outerWidth(true)
            var col_end_date_width = $('#gantt_here .gantt_grid_scale div[column_id="end_date"]').outerWidth(true)
            //var col_text = $('#gantt_here .gantt_grid_scale div[column_id="text"]')
            //var col_text_width = grid_width - col_start_date_width - col_end_date_width

            $('.gantt_task').width(task_width);

            //gantt.config.columns=[
            //    {name:"text", label:"Задачи",  tree:true, width: col_text_width, align: 'left'  },
            //    {name: 'start_date', label: 'Начало', width: 70, align: 'center'},
            //    {name: 'end_date', label: 'Окончание', width: 70, align: 'center'}
            //]

            gantt.config.grid_width = grid_width;
            gantt.$grid_data.style.width = (grid_width - 1) + "px";

            //col_text.width(col_text_width)

            //gantt._render_grid();
            //var get_col_text_width = $('#gantt_here .gantt_grid_scale div[column_id="text"]').width()
            //$('.gantt_row div.gantt_cell:first-child').width(col_text_width - 12)

            //$('.gantt_grid_scale, .gantt_grid_data').width(grid_width)
            //console.log(gantt.updatedRows.length);
        }}); */
    });
    $('#gantt_here').hide()
    gantt.init("gantt_here");




    //
    //gantt.parse(tasks)

    //$( ".gantt_grid_head_start_date" ).resizable();



    gantt.load('gantt.js', function(){
        after_render_gantt();
        //$("table.gantt_container_table").colResizable();
        $("table.gantt_grid").colResizable({headerOnly: true, onResize: function(e){
            var columns = $(e.currentTarget).find('th.gantt_grid_head_cell');
            var head_width = 0
            $.each(columns, function(ind, column){
                var name = $(column).attr('column_id')
                columns_hash[name]["width"] = parseInt(column.style.width.replace('px',''))
                //console.log(name+':'+column.style.width)
                head_width += columns_hash[name]["width"]
            })
            //console.log(columns_hash)
            gantt.config.columns = []
            $.each(columns_hash, function(key, value) { gantt.config.columns.push(value) })
            gantt.config.scroll_size = gantt._detectScrollSize();
            gantt.config.grid_width = head_width;
            gantt.setSizes();
            gantt._scroll_resize();
            //gantt.render();
        }});


    });

    $(document).on('click', '.gantt_tree_content a, .gantt_tooltip a, .gantt_tree_icon.gantt_tree_avatar img', function(e){
        e.preventDefault();
        var url = $(this).attr('href')
        window.open(url,'_blank');
        return false;
    })



    /*$.each(tasks["data"], function(i, val){
        gantt.addTask(val)
    })*/



    window.gantt_print =function(template){
        //console.log(gantt.$task_bg)
        //gantt.render()

        //var printWin= open('', 'displayWindow','width=800,height=600,status=no,toolbar=no,menubar=no,scrollbars=yes');
        //printWin.focus()
        //printWin.document.write(template)
    }



})