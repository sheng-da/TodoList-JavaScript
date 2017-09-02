    ;(function () {
        'use strict';

        var $form_add_task = $('.add-task')
            , $window = $(window)
            , $body = $('body')
            , $task_delete_trigger
            , $task_detail_trigger
            , $task_detail = $('.task-detail')
            , $task_detail_mask =$('.task-detail-mask')
            , task_list = []
            , current_index
            , $update_form
            , $task_detail_content
            , $task_detail_content_input
            , $checkbox_complete_trigger
            , $msg = $('.msg')
            , $msg_content = $msg.find('.msg-content')
            , $msg_confirm = $msg.find('.confirmed')
            , $alert = $('.alert')
            ;

        init();


        $form_add_task.on('submit',on_add_task_form_submit);
        $task_detail_mask.on('click',hide_task_detail);

        function myAlert(arg){
            if (!arg) {
                console.error('arg is required.');
            }
            var conf = {}
                , $box
                , $mask
                , $title
                , $content
                , $confirm
                , $cancel
                , deferred
                , confirmed
                , timer
            ;

            deferred = $.Deferred();

            if(typeof arg== 'string') {
                conf.title = arg;
            } else {
                conf = $.extend(conf,arg);
            }

            $box = $('<div>' +
                '<div class="notify-title">' + conf.title + '</div>' +
                '<div class="notify-content">' +
                '<div><button style= "margin-right: 10px" class="confirm">YES</button><button class="cancel">NO</button></div>' +
                '</div>' +
                '</div>')
                .css({
                    color: '#444',
                    position: 'fixed',
                    width:300,
                    height:100,
                    background: '#c5d5ec',
                    'border-radius': 3,
                    'box-shadow': '0 1px 2px rgba(0,0,0, 0.5)',
                });


            $mask= $('<div></div>')
                .css({
                    position: 'fixed',
                    background: 'rgba(0,0,0, .5)',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                });

            $content = $box.find('.notify-content').css({
                padding: '5px 10px',
                'text-align': 'center'
            });

            $confirm = $content.find('button.confirm');
            $cancel = $content.find('button.cancel');

            timer = setInterval(function () {
                if (confirmed !== undefined) {
                    deferred.resolve(confirmed);
                    clearInterval(timer);
                    dismiss_notify();
                }
            },50);

            $confirm.on('click', function(){
                confirmed = true;
            });

            $cancel.on('click', function(){
                confirmed = false;
            });

            $mask.on('click', function(){
                confirmed = false;
            });


            $title = $box.find('.notify-title').css({
                padding: '5px 10px',
                'font-weight': 900,
                'font-size': 20,
                'text-align': 'center'

            });

            function dismiss_notify() {
                $mask.remove();
                $box.remove();
            }

            function adjust_box_position() {
                var window_width = $window.width()
                    ,window_height = $window.height()
                    ,box_width = $box.width()
                    ,box_height = $box.height()
                    ,move_x
                    ,move_y;

                move_x = (window_width - box_width)/2;
                move_y = ((window_height - box_height)/2)-40;

                $box.css({
                    left: move_x,
                    top: move_y,
                })
            }

            adjust_box_position();

            $window.on('resize', function () {
                adjust_box_position();
            });



            $mask.appendTo($body);
            $box.appendTo($body);
            $window.resize();
            return deferred.promise();
        }



        function notify_confirm_listener() {
            $msg_confirm.on('click', function () {
                hide_notify();
            })
        }


        function update_task_list() {
            /* update local storage*/
            store.set('task_list',task_list);
            render_task_list();

        }

        function on_add_task_form_submit(e){
                var new_task={}, $input;
                /* forbit default */
                e.preventDefault();
                /* get new task value */
                $input = $(this).find('input[name=content]');
                new_task.content = $input.val();
                /* return if task value is empty */
                if (!new_task.content) return;
                /* add new task*/
                if (add_task(new_task)) {
                    $input.val('');
                }
        }

        function task_detail_listener() {
            $task_detail_trigger.on('click', function () {
                var $this = $(this);
                var $item = $this.parent().parent();
                var index = $item.data('index');
                show_task_detail(index);
            })
        }

        function show_task_detail(index) {
            render_task_detail(index);
            current_index = index;
            $task_detail.show();
            $task_detail_mask.show();
        }

        function update_task(index, data) {
            if (!index || !task_list[index]) return;

            task_list[index] = $.extend(task_list[index], data);
            update_task_list();
        }

        function hide_task_detail() {
            $task_detail.hide();
            $task_detail_mask.hide();
        }

        function render_task_detail(index) {
            if (index === undefined || !task_list[index]) return;
            var item = task_list[index];
            var tpl =
                '<form>' +
                '<div class="content">' +
                 item.content +
                '</div>' +
                '<div class="input-item"><input style="display:none;" type="" name="content" value="' + item.content +'"></div>'+
                '<div>'  +
                '<div class="desc input-item">' +
                '<textarea name="desc">' + (item.desc || '') + '</textarea>' +
                '</div>' +
                '</div>'  +
                '<div class="remind input-item">'  +
                '<label>Reminder</label>' +
                '<input class="datetime" name="remind_date" type="text" value="' + (item.remind_date || '')  + '">' +
                '</div>' +
                '<div class="input-item"><button type="submit">Update</button></div>' +
                '</form>';

            $task_detail.html(null);
            $task_detail.html(tpl);
            $('.datetime').datetimepicker();


            $update_form = $task_detail.find('form');
            $task_detail_content = $update_form.find('.content');
            $task_detail_content_input = $update_form.find('[name=content]');
            $task_detail_content.on('dblclick', function () {
                $task_detail_content_input.show();
                $task_detail_content.hide();
            });


            $update_form.on('submit', function(e) {
                e.preventDefault();
                var data = {};
                data.content = $(this).find('[name=content]').val();
                data.desc = $(this).find('[name=desc]').val();
                data.remind_date = $(this).find('[name=remind_date]').val();
                update_task(index, data);
                hide_task_detail();
            })

        }

        /* Listen to checkbox click event*/
        function checkbox_complete_listener() {
            $checkbox_complete_trigger.on('click', function(){
                var $this = $(this);
                var is_complete = $this.is(':checked');
                var index = $this.parent().parent().data('index');
                var item = get_task_item(index);
                if (item.complete)
                {
                    update_task(index, {complete: false});
                }
                else
                {
                    update_task(index, {complete: true});
                }
            })

        }

        function get_task_item(index){
            return store.get('task_list')[index];
        }


        /* listen to any task delete event and delete the according item */
        function task_delete_listener() {
            $task_delete_trigger.on('click', function(){
                var $this = $(this);
                var $item = $this.parent().parent();
                var index = $item.data('index');
                var res = myAlert('Do you want to delete this item?')
                    .then(function(r) {
                        r ? delete_task(index) : null;
                    })
            })
        }

        /* delete task according to the given index */
        function delete_task(index) {
            /*return if no index or index item doesn't exist*/
            if (index === undefined || !task_list[index]) return;

            delete task_list[index];
            update_task_list();
        }


        function add_task(new_task)
        {
            /* push new task in to task list*/
            task_list.push(new_task);
            update_task_list();
            return true;
        }

        function init() {
            task_list = store.get('task_list') || [];
            notify_confirm_listener();
            if (task_list.length) {
                render_task_list();
            }

            task_notify_check();

        }

        function task_notify_check() {
            var current_timestamp;
            var itr = setInterval(function(){
                for (var i = 0; i < task_list.length; i++) {
                    var item = task_list[i], task_timestamp;
                    if (!item || !item.remind_date || item.informed) continue;
                    current_timestamp = new Date().getTime();
                    task_timestamp = (new Date(item.remind_date)).getTime();
                    if (current_timestamp - task_timestamp >= 1) {
                        update_task(i,{informed: true});
                        update_task(i,{complete: true});
                        show_notify("Reminder: " + item.content);
                    }
                }
            } , 300);
        }

        function show_notify(msg) {
            $msg_content.html(msg);
            $alert.get(0).play();
            $msg.show();
        }

        function hide_notify() {
            $msg.hide();
        }



        function render_task_item(data, index) {
            if (!data || !index) return;
            var list_item_tpl =
                '<div class="task-item" data-index="' + index + '">' +
                '<span><input class="complete" ' + (data.complete ? 'checked' : '')  + ' type="checkbox"></span>' +
                '<span class="task-content">' + data.content + '</span>'+
                '<span class="float-right">' +
                '<span class="action delete"> Delete </span>' +
                '<span class="action detail"> Detail </span>' +
                '</span>'+
                '</div>';
            return $(list_item_tpl);
        }

        function render_task_list() {
            var $task_list = $('.task-list');
            $task_list.html('');
            /*var complete_items = [];*/
            for (var i = 0; i < task_list.length; i++) {
                var item = task_list[i];
                if (item && item.complete) {
                    /*complete_items.push(item);*/
                    var $task = render_task_item(item,i);
                    $task.addClass('completed');
                    $task_list.append($task);
                }
                else {
                    var $task = render_task_item(item,i);
                    $task_list.prepend($task);
                }
            }

            $task_delete_trigger = $('.action.delete');
            $task_detail_trigger = $('.action.detail');
            $checkbox_complete_trigger = $('.task-list .complete[type=checkbox]');
            task_delete_listener();
            task_detail_listener();
            checkbox_complete_listener();
        }

    })();

