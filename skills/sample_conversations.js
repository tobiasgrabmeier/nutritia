/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's conversation system.

In this example, Botkit hears a keyword, then asks a question. Different paths
through the conversation are chosen based on the user's response.

*/

function calculate_dac(age, gender, height, weight) {

  var bmr;
  var pal = 1.2;

  if(gender == 'Male') {

      bmr = 66.5 + 13.7 * weight + 5 * height - 6.8 * age;

  } else if (gender == 'Female') {

      bmr = 665 + 9.6 * weight + 1.8 * height - 4.7 * age;

  }

  return bmr * pal;

}

module.exports = function(controller) {

    controller.hears(['sample_get_started_payload'], 'message_received', function(bot, message) {

          var askAge = function(response, convo) {
            convo.say('Hey there! I am Nutritia, your personal nutrition coach. If you eat a healthy meal tonight, I am happy :) To help you suggest a healthy dinner I would like to ask you five questions about you:');
            convo.ask('What is your age?', function(response, convo) {
              convo.say('Awesome. ' + response.text + ' years young :)');
              askGender(response, convo);
              convo.next();
            },{key: 'age'});
          }

          var askGender = function(response, convo) {
            convo.ask({
              text: 'Are you female or male?',
              quick_replies: [{
                content_type: 'text',
                title: 'Female',
                payload: 'female'
              },{
                content_type: 'text',
                title: 'Male',
                payload: 'male'
              }]
            }, function(response, convo) {
              convo.say('Ok.')

              askGoal(response, convo);
              convo.next();
            },
            {key: 'gender'});
          }

          var askGoal = function(response, convo) {
            convo.ask({
              text: 'What do you want to achieve?',
              quick_replies: [{
                content_type: 'text',
                title: 'Loose weight',
                payload: 'loose_weight'
              },{
                content_type: 'text',
                title: 'Build muscle',
                payload: 'build_muscle'
              },{
                content_type: 'text',
                title: 'Just live healty',
                payload: 'live_healthy'
              }]
            }, function(response, convo) {
              convo.say('\u1F4AA');
              askHeight(response, convo);

              convo.next();
            },
            {key: 'goal'});
          }

          var askHeight = function(response, convo) {
            convo.ask('How tall are you (in cm)?', function(response, convo) {
              convo.say('Ok. Almost there :)');
              askWeight(response, convo);
              convo.next();
            },{key: 'height'});
          }

          var askWeight = function(response, convo) {
            convo.ask('What\'s your weight (in kg)?', function(response, convo) {
              convo.say('Perfect.');
              tellResults(response, convo);
              convo.next();
            },{key: 'weight'});
          }

          var tellResults = function(response, convo) {

            var data = convo.extractResponses();
            var dac = calculate_dac(data.age, data.gender, data.height, data.weight);

            convo.say('So your daily amount of calories should be around ' + dac);
            convo.next();

          }

          bot.startConversation(message, function(response, convo){

            askAge(response, convo);
            convo.on('end', function(convo) {
              if (convo.successful()) {
                var user = convo.context.user;
                var data = convo.extractResponses();


              console.log('Lests see data: ', data);
            }

          });


	});


    });


    controller.hears(['question'], 'message_received', function(bot, message) {

        bot.createConversation(message, function(err, convo) {

            // create a path for when a user says YES
            convo.addMessage({
                    text: 'How wonderful.',
            },'yes_thread');

            // create a path for when a user says NO
            // mark the conversation as unsuccessful at the end
            convo.addMessage({
                text: 'Cheese! It is not for everyone.',
                action: 'stop', // this marks the converation as unsuccessful
            },'no_thread');

            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Sorry I did not understand. Say `yes` or `no`',
                action: 'default',
            },'bad_response');

            // Create a yes/no question in the default thread...
            convo.ask('Do you like cheese?', [
                {
                    pattern:  bot.utterances.yes,
                    callback: function(response, convo) {
                        convo.gotoThread('yes_thread');
                    },
                },
                {
                    pattern:  bot.utterances.no,
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ]);

            convo.activate();

            // capture the results of the conversation and see what happened...
            convo.on('end', function(convo) {

                if (convo.successful()) {
                    // this still works to send individual replies...
                    bot.reply(message, 'Let us eat some!');

                    // and now deliver cheese via tcp/ip...
                }

            });
        });

    });

};
