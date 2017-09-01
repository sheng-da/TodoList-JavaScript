    ;(function () {
        'use strict';

        var $form_add_task = $('.add-task')
            , $task_delete_trigger
            , $task_detail_trigger
            , $task_detail = $('.task-detail')
            , $task_detail_mask =$('.task-detail-mask')
            , task_list = []
            , current_index
            , $update_form
            , $task_detail_content
            , $task_detail_content_input
            ;

        init();
        $form_add_task.on('submit',on_add_task_form_submit);
        $task_detail_mask.on('click',hide_task_detail);



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

            task_list[index] = data;
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
                '<input name="remind_date" type="date" value="' + item.remind_date + '">' +
                '</div>' +
                '<div class="input-item"><button type="submit">Update</button></div>' +
                '</form>';

            $task_detail.html(null);
            $task_detail.html(tpl);
            $update_form = $task_detail.find('form');
            $task_detail_content = $update_form.find('.content');
            $task_detail_content_input = $update_form.find('[name=content]')
            $task_detail_content.on('dblclick', function () {
                $task_detail_content_input.show();
                $task_detail_content.hide();
            })


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


        /* listen to any task delete event and delete the according item */
        function task_delete_listener() {
            $task_delete_trigger.on('click', function () {
                var $this = $(this);
                var $item = $this.parent().parent();
                var index = $item.data('index');
                var res = confirm('Do you want to delete this item?');
                res ? delete_task(index) : null;
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
            if (task_list.length)
                render_task_list();
        }


        function render_task_item(data, index) {
            if (!data || !index) return;
            var list_item_tpl =
                '<div class="task-item" data-index="' + index + '">' +
                '<span><input type="checkbox"></span>' +
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
            for (var i = 0; i < task_list.length; i++) {
                var $task = render_task_item(task_list[i],i);
                $task_list.prepend($task);
            }

            $task_delete_trigger = $('.action.delete');
            $task_detail_trigger = $('.action.detail');
            task_delete_listener();
            task_detail_listener();
        }

    })();

