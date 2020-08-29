odoo.define('sms/static/src/components/message/message_tests.js', function (require) {
'use strict';

const components = {
    Message: require('mail/static/src/components/message/message.js'),
};
const {
    afterEach,
    afterNextRender,
    beforeEach,
    createRootComponent,
    start,
} = require('mail/static/src/utils/test_utils.js');

const Bus = require('web.Bus');

QUnit.module('sms', {}, function () {
QUnit.module('components', {}, function () {
QUnit.module('message', {}, function () {
QUnit.module('message_tests.js', {
    beforeEach() {
        beforeEach(this);

        this.createMessageComponent = async (message, otherProps) => {
            const props = Object.assign({ messageLocalId: message.localId }, otherProps);
            await createRootComponent(this, components.Message, {
                props,
                target: this.widget.el,
            });
        };

        this.start = async params => {
            const { env, widget } = await start(Object.assign({}, params, {
                data: this.data,
            }));
            this.env = env;
            this.widget = widget;
        };
    },
    afterEach() {
        afterEach(this);
    },
});

QUnit.test('Notification Sent', async function (assert) {
    assert.expect(9);

    await this.start();
    const threadView = this.env.models['mail.thread_view'].create({
        thread: [['create', {
            id: 11,
            model: 'mail.channel',
        }]],
    });
    const message = this.env.models['mail.message'].create({
        id: 10,
        message_type: 'sms',
        notifications: [['insert', {
            id: 11,
            notification_status: 'sent',
            notification_type: 'sms',
            partner: [['insert', { id: 12, name: "Someone" }]],
        }]],
        originThread: [['link', threadView.thread]]
    });
    await this.createMessageComponent(message, {
        threadViewLocalId: threadView.localId
    });

    assert.containsOnce(
        document.body,
        '.o_Message',
        "should display a message component"
    );
    assert.containsOnce(
        document.body,
        '.o_Message_notificationIconContainer',
        "should display the notification icon container"
    );
    assert.containsOnce(
        document.body,
        '.o_Message_notificationIcon',
        "should display the notification icon"
    );
    assert.hasClass(
        document.querySelector('.o_Message_notificationIcon'),
        'fa-mobile',
        "icon should represent sms"
    );

    await afterNextRender(() => {
        document.querySelector('.o_Message_notificationIconContainer').click();
    });
    assert.containsOnce(
        document.body,
        '.o_NotificationPopover',
        "notification popover should be open"
    );
    assert.containsOnce(
        document.body,
        '.o_NotificationPopover_notificationIcon',
        "popover should have one icon"
    );
    assert.hasClass(
        document.querySelector('.o_NotificationPopover_notificationIcon'),
        'fa-check',
        "popover should have the sent icon"
    );
    assert.containsOnce(
        document.body,
        '.o_NotificationPopover_notificationPartnerName',
        "popover should have the partner name"
    );
    assert.strictEqual(
        document.querySelector('.o_NotificationPopover_notificationPartnerName').textContent.trim(),
        "Someone",
        "partner name should be correct"
    );
});

QUnit.test('Notification Error', async function (assert) {
    assert.expect(8);

    const bus = new Bus();
    bus.on('do-action', null, payload => {
        assert.step('do_action');
        assert.strictEqual(
            payload.action,
            'sms.sms_resend_action',
            "action should be the one to resend sms"
        );
        assert.strictEqual(
            payload.options.additional_context.default_mail_message_id,
            10,
            "action should have correct message id"
        );
    });

    await this.start({ env: { bus } });
    const threadView = this.env.models['mail.thread_view'].create({
        thread: [['create', {
            id: 11,
            model: 'mail.channel',
        }]],
    });
    const message = this.env.models['mail.message'].create({
        id: 10,
        message_type: 'sms',
        notifications: [['insert', {
            id: 11,
            notification_status: 'exception',
            notification_type: 'sms',
        }]],
        originThread: [['link', threadView.thread]]
    });
    await this.createMessageComponent(message, {
        threadViewLocalId: threadView.localId
    });

    assert.containsOnce(
        document.body,
        '.o_Message',
        "should display a message component"
    );
    assert.containsOnce(
        document.body,
        '.o_Message_notificationIconContainer',
        "should display the notification icon container"
    );
    assert.containsOnce(
        document.body,
        '.o_Message_notificationIcon',
        "should display the notification icon"
    );
    assert.hasClass(
        document.querySelector('.o_Message_notificationIcon'),
        'fa-mobile',
        "icon should represent sms"
    );

    await afterNextRender(() => {
        document.querySelector('.o_Message_notificationIconContainer').click();
    });
    assert.verifySteps(
        ['do_action'],
        "should do an action to display the resend sms dialog"
    );
});

});
});
});

});