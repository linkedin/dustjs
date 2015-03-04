---
layout: guides
title: Context Helpers
permalink: /guides/context-helpers/
---

## Why use context helpers at all?

One of the central tenets of Dust's philosophy is the idea that your template should be as logic-free as possible. Following this guideline makes your templates lightweight and increases their understandability.

For example, to monitor the state of your application, Dust doesn't want you to write templates like this:

```
{! Don't do this !}
{@eq key="gearsTurning" value="true" type="boolean"}
  {@eq key="engineRunning" value="true" type="boolean"}
    {@eq key="onFire" value="false" type="boolean"}
      {@gt key="oilLevel" value="0.7"}
        Everything is awesome!
      {/gt}
    {/eq}
  {/eq}
{/eq}
```

If App 2.0 featured a `gyroscope` and you had to check that the `gyroscopeIsActive`, you would have to add yet another nested conditional. And what if you wanted to output different messages when your app is out of oil or when it is on fire? This template would grow to dozens of lines.

This is where **handlers**, or **context helpers** (they're the same thing by different names) can help. Your Dust context isn't limited to containing data like strings, numbers, and arrays. You can also include functions directly in the context that provide new data or transform existing data. This means Dust contexts act somewhat like **view models**.

Using a handler, we could rewrite our template to something much simpler:

```
{#appStatusOK}
  Everything is awesome!
{/appStatusOK}
```

And move all the logic to Javascript, where it belongs:

```
{
  "appStatusOK": function() {
     return gearsTurning &&
            engineRunning &&
            !onFire &&
            oilLevel > 0.7;
  }
}
```

Now, your template doesn't care about the precise details of what makes your app tick-- only if it's OK or not.

As a bonus, your handler can be much smarter than a template. Don't worry about all the syntax here; we'll go over it in more detail later.

```
{#appStatusOK}
  Everything is awesome!
  {:gearsError}
    Gears are stopped! Status code: {error}
  {:engineError}
    Engine is not running! Engine temperature: {engineTemp}
  {:oilLevelError}
    Oil level is too low! Current level: {oilLevel}
{/appStatusOK}
```

```
{
  "appStatusOK": function(chunk, context, bodies, params) {
     if(!gearsTurning) {
       return chunk.render(bodies.gearsError,
                           context.push({ error: gears.status });
     } else if(!engineRunning) {
       return chunk.render(bodies.engineError,
                           context.push({ engineTemp: context.get("engine.temperature") });
     } else if(oilLevel < 0.7) {
       return chunk.render(bodies.oilLevelError, context);
     }
     return true;
  }
}
```

## Writing context helpers

### Returning a value

The most basic context helpers simply return a value. The value will act just like a value contained in the context.

```
{
  "friends": ["Alice", "Bob", "Charlie"],
  "friendsHelper": function() {
    return ["Alice", "Bob", "Charlie"];
  },
  "hasFriends": true,
  "hasFriendsHelper": function() {
    return this.friends.length > 0;
  }
}
```

### Accessing the template

Context helpers are passed several parameters to provide information about their template and context. The full signature of a context helper is:

```
function(chunk, context, bodies, params) {}
```

#### Chunk

Context helpers can access the current section of their template to modify it. In Dust, this section is called a **chunk**. Returning the chunk instead of a value tells Dust that you have manually overridden the output of that variable or section.

```
{
  "status": function(chunk) {
    return chunk.write("System Status:\n")
                .write("Hyperdrive: " + this.hyperDriveStatus + "\n")
                .write("Photon Torpedoes: " + this.photonTorpedoCount);
  }
}
```

#### Context

Context helpers can read values out of any level of the Dust context passed to the template, not just the current scope.

Remember that Dust contexts are "stacks" of objects, and that Dust can read upwards through multiple levels. For a refresher on contexts, see [Helper API](/docs/helper-api/).

```
{
  "engine": {
    "temperature": 180,
    "rpm": 3100
  },
  "flywheel": {
    "active": true
  },
  "status": {
    "helper": function(chunk, context) {
      // Access nested context paths via arrays or dotted notation
      var engineRPM = context.get(["engine", "rpm"]),
          flywheelActive = context.get("flywheel.active");

      return (engineRPM < 9000) && flywheelActive;
    }
  }
}
```

#### Bodies

As you've seen, Dust sections might have multiple bodies that output conditionally. The most common one is an `{:else}` body, which you might have used as part of an `{?exists}` block or an `{@eq}` helper.

Using a context helper, you can define your own bodies and have as many as you want. This lets you keep HTML and text in the template where it belongs, instead of conditionally outputting various strings as part of your Javascript.

```
{#login}
  Welcome!
  {:usernameError}
  Your username was not found.
  {:passwordError}
  Your password was incorrect. You have {.} attempts remaining.
  {:else}
  Please log in!
{/login}
```
```
{
  "login": function(chunk, context, bodies) {
    var username = context.get("username"),
        password = context.get("password"),
        status = authorizeUser(username, password);

    switch(status.message) {
      case "OK":
        return true;
      case "InvalidUserName":
        return chunk.render(bodies.usernameError, context);
      case "InvalidPassword":
        return chunk.render(bodies.passwordError,
                            context.push(status.loginAttemptsRemaining);
    }

    return false;
  }
}
```

#### Params

Context helpers can be passed parameters just like regular Dust sections. They are accessed through the **params** argument.

```
{#price value="39.9" /}
```
```
{
  "price": function(chunk, context, bodies, params) {
    return chunk.write("$" + Number(params.value).toFixed(2));
  }
}
```

##### Evaluating a parameter

If a parameter contains a Dust reference, you must evaluate the reference if you want to use it in your context helper. Reference evaluation is done using `dust.helpers.tap()` (provided as part of the `dustjs-helpers` addon).

```
{#say text="Hello {name}!"/}
```
```
{
  "say": function(chunk, context, bodies, params) {
    var text = dust.helpers.tap(params.text, chunk, context);
    text = text.toUpperCase();
    return chunk.write(text);
  }
}
```

## Asynchronous context helpers

Dust's asynchronous nature is one of its defining features. Writing context helpers in an async way lets you make HTTP requests or call services without blocking the rendering of your template.

```
{#ip}Your IP address: {ip}{/ip}
```

```
{
  "ip": function(chunk, context, bodies, params) {
    return chunk.map(function(chunk) {
      $.get("//ip.jsontest.com/", function(data) {
        // data contains { "ip": "123.45.67.89" }
        return chunk.render(bodies.block, context.push(data))
                    .end();
      });
    });
  }
}
```
To start an asynchronous block, call `chunk.map`. Inside its callback function, you can perform any sync or async operations. The only difference is that when you're done, you must call `chunk.end` to signal that the async operations have completed.

You can't return a value from an asynchronous helper like you can a normal one. You must return a chunk that has been `end`ed.

## Try it out

Try these exercises to help you further your understanding of context helpers!

### The Bad API

Your JSON data is badly-formatted, as seen in the sample. Write a helper to reformat this data to make the template work.

```
{#friends}
  {name} - {birthday}
{/friends}
```

#### Solution

```
{
  "people": ["Alice", "Bob", "Charles"],
  "birthdays": {
    "Alice": "12/01/84",
    "Bob": "08/30/66",
    "Charles": "07/07/77"
  },
  "friends": function(chunk, context, bodies, params) {
    var friends = [],
        people = context.get("people"),
        birthdays = context.get("birthdays");

    people.forEach(function(person) {
      chunk.render(bodies.block, context.push({
        "name": person,
        "birthday": birthdays[person]
      }));
    });
  }
}
```

### Temperature Converter

Our weather API reports temperatures in Fahrenheit, but we need to display in Celsius.

```
{#convertToCelsius temp="32" /} {! 0 !}
```

The formula to convert is:

```
(F - 32) * 5/9
```

#### Solution

```
{
  "convertToCelsius": function(chunk, context, bodies, params) {
    var f = params.temp,
        c = (f - 32) * 5/9;
    return chunk.write(c);
  }
}
```

#### Extra Credit

Turn your helper into a `temperatureConverter` that takes **either** a `c` or `f` parameter, and outputs the other one.

### Race Winners

We have a list of racers and their times, but we want to show them in order so we know who won.

```
{#orderedRacers}
  {name} - {time} minutes {~n}
{/orderedRacers}
```

#### Solution

```
{
  "racers": [
    { "name": "Mario", time: 5.8 },
    { "name": "Bowser", time: 4.9 },
    { "name": "Peach", time: 5.1 },
    { "name": "Daisy", time: 7 },
    { "name": "Toad", time: 5.2 }
  ],
  "orderedRacers": function(chunk, context, bodies, params) {
    var racers = context.get("racers");
    racers.sort(function(a, b) {
      return a.time - b.time;
    });
    return racers;
  }
}
```

#### Extra Credit

Write a second helper that takes the `{time}` in minutes from the context and formats it into minutes and seconds, and incorporate that into your list.

```
{
  "minutesSeconds": function(chunk, context, bodies, params) {
    var time = context.get("time"),
        minutes = Math.floor(time),
        seconds = Math.round((time - minutes) * 60);

    if(minutes) { chunk.write(minutes + "m"); }
    if(seconds) { chunk.write(seconds + "s"); }
    return chunk;
  }
}
```
