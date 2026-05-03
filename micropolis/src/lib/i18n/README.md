# Internationalization Boundary

The CLI, data files, comments, and diagnostic output may use English strings directly.

Browser UI should treat English labels in command metadata as fallbacks. Render translated text by looking up stable keys such as:

```text
commands.sim.toggle-pause.label
commands.city.generate-random.description
commands.tax.increase.group
```

`CommandBus` assigns default command keys from command IDs, so command authors can add labels immediately while translators fill tables later.
