# enb-svg-icon

## Example

```javascript
config.mode('icons', function() {
    var srcDir = 'src/svg';
    fs.readdir(srcDir, function(err, files) {
        files.map(function(file) {
            var iconBaseName = path.basename(file, path.extname(path.basename(file)));

            config.node('src/blocks/common.blocks/icon/_type/', function(nodeConfig) {
                var iconFileName = 'icon_type_' + iconBaseName;

                nodeConfig.addTechs([
                    [techs.svgIcon, { src : path.join(srcDir, file), target : iconFileName + '.bemhtml' }],
                    [techs.svgIcon, { src : path.join(srcDir, file), target : iconFileName + '.css' }]
                ]);
                nodeConfig.addTargets([ iconFileName + '.css', iconFileName + '.bemhtml' ]);
            });
        });
    });
});
```