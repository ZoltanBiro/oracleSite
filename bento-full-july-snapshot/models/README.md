# models/

Each Labs app that needs persistence gets its own subfolder here, matching
its route slug — keeps schemas from colliding as experiments evolve
independently.

Example, once you build a real labs app:

```
models/
  example-app/
    Entry.js       // mongoose.model('ExampleAppEntry', schema, 'example_app_entries')
```

Convention: name the underlying Mongo collection with the app slug as a
prefix (e.g. `example_app_entries`, `example_app_users`) so collections are
easy to identify and clean up independently, even though they all live in
the same `labs` database.

The main site has no models — it's static and has no DB needs.
