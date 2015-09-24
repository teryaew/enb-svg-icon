var bemNaming = require('bem-naming')({ elem : '__', mod : '_' });
var fs = require('fs');
var html2bemjson = require('html2bemjson');
var path = require('path');
var repeat = require('lodash.repeat');
var vow = require('vow');

module.exports = require('enb/lib/build-flow').create()
    .name('enb-svg-icon')
    .target('target')

    .builder(function() {
        var _this = this;
        var def = vow.defer();

        this._targetName = path.basename(this._target, path.extname(path.basename(_this._target)));
        this._targetSvgName = this._targetName + '.svg';
        this._targetBemObject = this.getTargetBemObject(this._targetName);
        this._destSvg = path.resolve(this.node.getPath(), this._targetSvgName);

        this._hasBemhtml = path.extname(_this._options.target) === '.bemhtml';
        this._hasCss = path.extname(_this._options.target) === '.css';

        fs.readFile(this._options.src, 'utf8', function(err, data) {
            if (err) console.error(err);

            if (_this._hasBemhtml) {
                def.resolve(_this.getBemhtmlTpl(data));
            }
            if (_this._hasCss) {
                fs.writeFile(_this._destSvg, data, function(err) {
                    if (err) console.error(err);

                    def.resolve(_this.getCssTpl(data));
                });
            }
        });

        return def.promise();
    })

    .methods({
        getTargetBemObject : function(str) {
            if (bemNaming.validate(str)) {
                return bemNaming.parse(str);
            } else {
                console.error('Source SVG filename is not compatible with BEM notation.');
                return;
            }
        },
        getBemhtmlTpl : function(data) {
            var bem = this._targetBemObject;
            var bemjson = html2bemjson
                            .stringify(data)
                            .replace(/^\s{4}/gm, repeat(' ', 20))
                            .replace(/\}$/g, repeat(' ', 16) + '}');

            return [
                'block(\'' + bem.block + '\')(',
                '    mod(\'' + bem.modName + '\', \'' + bem.modVal  + '\')(',
                '        attrs()(function() {',
                '            return !this.ctx.css && {',
                '                style : \'background-image: none\'',
                '            };',
                '        }),',
                '        content()(function() {',
                '            return [',
                '                !this.ctx.css && ' + bemjson,
                '            ];',
                '        })',
                '    )',
                ');'
            ].join('\n');
        },
        getCssTpl : function(data) {
            var bem = this._targetBemObject;
            var sep = bemNaming.modDelim;

            return [
                '.' + bem.block + sep + bem.modName + sep + bem.modVal,
                '{',
                '    background-image: url("' + this._targetSvgName + '");',
                '}'
            ].join('\n');
        }
    })

    .createTech();