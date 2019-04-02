// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Import required Bot Framework classes.
const { ActivityTypes, MessageFactory, TurnContext } = require('botbuilder');
const { CardFactory } = require('botbuilder');

// Adaptive Card content
const IntroCard = require('./resources/IntroCard.json');

// Welcomed User property name
const WELCOMED_USER = 'welcomedUserProperty';

class WelcomeBot {
    /**
     *
     * @param {UserState} User state to persist boolean flag to indicate
     *                    if the bot had already welcomed the user
     */
    constructor(userState) {
        // Creates a new user property accessor.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
        this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);

        this.userState = userState;
    }
    /**
     *
     * @param {TurnContext} context on turn context object.
     */
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            const didBotWelcomedUser = await this.welcomedUserProperty.get(turnContext, false);

            if (didBotWelcomedUser === false) {
                await this.sendSuggestedActions(turnContext);
                await this.welcomedUserProperty.set(turnContext, true);
            } else {
                let text = turnContext.activity.text;
                const validOptions = ['FAQS', 'Band Search', 'Navigate'];
                if (validOptions.includes(text)) {
                    await turnContext.sendActivity(`You clicked ${ text }! `);
                    await this.sendSuggestedActions(turnContext);
                } else {
                    await turnContext.sendActivity('U R WRONG');
                    await this.sendSuggestedActions(turnContext);
                }
            }
        }
        // Save state changes
        await this.userState.saveChanges(turnContext);
    }

    /**
     * Sends welcome messages to conversation members when they join the conversation.
     * Messages are only sent to conversation members who aren't the bot.
     * @param {TurnContext} turnContext
     */
    async sendWelcomeMessage(turnContext) {
        // Do we have any new members added to the conversation?
        if (turnContext.activity.membersAdded.length !== 0) {
            // Iterate over all new members added to the conversation
            for (let idx in turnContext.activity.membersAdded) {
                // Greet anyone that was not the target (recipient) of this message.
                // Since the bot is the recipient for events from the channel,
                // context.activity.membersAdded === context.activity.recipient.Id indicates the
                // bot was added to the conversation, and the opposite indicates this is a user.
                if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                    await turnContext.sendActivity(`Welcome to the 'Welcome User' Bot. This bot will introduce you to welcoming and greeting users.`);
                    await turnContext.sendActivity("You are seeing this message because the bot received at least one 'ConversationUpdate'" +
                        'event,indicating you (and possibly others) joined the conversation. If you are using the emulator, ' +
                        "pressing the 'Start Over' button to trigger this event again. The specifics of the 'ConversationUpdate' " +
                        'event depends on the channel. You can read more information at https://aka.ms/about-botframework-welcome-user');
                    await turnContext.sendActivity(`It is a good pattern to use this event to send general greeting to user, explaining what your bot can do. ` +
                        `In this example, the bot handles 'hello', 'hi', 'help' and 'intro. ` +
                        `Try it now, type 'hi'`);
                }
            }
        }
    }

    /**
 * Send suggested actions to the user.
 * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
 */
    async sendSuggestedActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['FAQs', 'Band Search', 'Navigate'], 'How would you like to explore the event?');
        await turnContext.sendActivity(reply);
    }
}

module.exports.WelcomeBot = WelcomeBot;
