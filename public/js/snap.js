(function(interact)
{
    'use strict';

    var canvas;
    var context;
    var guidesCanvas;
    var guidesContext;
    var width = 600;
    var height = 600;
    var status;
    var prevX = 0;
    var prevY = 0;
    var blue = '#2299ee';
    var lightBlue = '#88ccff';
    var tango = '#ff4400';
    var draggingAnchor = null;
    var balloon_radius = 60;

    var snapOffset = {
        x: 0,
        y: 0
    };

    var snapGrid = {
        x: 225,
        y: 225,
        range: Infinity,
        offset: { x: 75, y: 75 }
    };

    var gridFunc = interact.createSnapGrid(snapGrid);
    var anchors = [
        {
            x: 100,
            y: 100,
            range: 200
        },
        {
            x: 600,
            y: 400,
            range: Infinity
        },
        {
            x: 500,
            y: 150,
            range: Infinity
        },
        {
            x: 250,
            y: 250,
            range: Infinity
        }
    ];

    function drawGrid(grid, gridOffset, range)
    {
        if (!grid.x || !grid.y)
        {
            return;
        }

        var barLength = 16;
        var offset = {
            x: gridOffset.x + snapOffset.x,
            y: gridOffset.y + snapOffset.y
        };

        guidesContext.clearRect(0, 0, width, height);

        guidesContext.fillStyle = lightBlue;

        if (range < 0 || range === Infinity)
        {
            guidesContext.fillRect(0, 0, width, height);
        }

        for (var i = -(1 + offset.x / grid.x | 0), lenX = width / grid.x + 1; i < lenX; i++)
        {
            for (var j = -( 1 + offset.y / grid.y | 0), lenY = height / grid.y + 1; j < lenY; j++)
            {
                if (range > 0 && range !== Infinity)
                {
                    guidesContext.circle(i * grid.x + offset.x, j * grid.y + offset.y, range, blue).fill();
                }

                guidesContext.beginPath();
                guidesContext.moveTo(i * grid.x + offset.x, j * grid.y + offset.y - barLength / 2);
                guidesContext.lineTo(i * grid.x + offset.x, j * grid.y + offset.y + barLength / 2);
                guidesContext.stroke();

                guidesContext.beginPath();
                guidesContext.moveTo(i * grid.x + offset.x - barLength / 2, j * grid.y + offset.y);
                guidesContext.lineTo(i * grid.x + offset.x + barLength / 2, j * grid.y + offset.y);
                guidesContext.stroke();
            }
        }
    }

    function drawAnchors(anchors, defaultRange)
    {
        var barLength = 16;
 
        guidesContext.clearRect(0, 0, width, height);

        if (range < 0 && range !== Infinity)
        {
            guidesContext.fillStyle = lightBlue;
            guidesContext.fillRect(0, 0, width, height);
        }

        for (var i = 0, len = anchors.length; i < len; i++)
        {
            var anchor = {
                x: anchors[i].x + snapOffset.x,
                y: anchors[i].y + snapOffset.y,
                range: anchors[i].range
            }
            var range = typeof anchor.range === 'number'? anchor.range: defaultRange;

            if (range > 0 && range !== Infinity) {
                guidesContext.circle(anchor.x, anchor.y, range, blue).fill();
            }

            guidesContext.beginPath();
            guidesContext.moveTo(anchor.x, anchor.y - barLength / 2);
            guidesContext.lineTo(anchor.x, anchor.y + barLength / 2);
            guidesContext.stroke();

            guidesContext.beginPath();
            guidesContext.moveTo(anchor.x - barLength / 2, anchor.y);
            guidesContext.lineTo(anchor.x + barLength / 2, anchor.y);
            guidesContext.stroke();
        }
    }

    function drawSnap(snap)
    {
        context.clearRect(0, 0, width, height);
        guidesContext.clearRect(0, 0, width, height);

        if (status.gridMode.checked)
        {
            drawGrid(snapGrid, snapGrid.offset, snapGrid.range);
        }
        else if (status.anchorMode.checked)
        {
            drawAnchors(anchors, snap.range);
        }
    }

    function circle(x, y, radius, color)
    {
        this.fillStyle = color || this.fillStyle;
        this.beginPath();

        this.arc(x, y, radius, 0, 2*Math.PI);

        return this;
    }

    window.CanvasRenderingContext2D.prototype.circle = circle;

    function dragMove(event)
    {
        var snap = event.snap;

        context.clearRect(0, 0, width, height);

        if (snap && snap.range !== Infinity && typeof snap.x === 'number' && typeof snap.y === 'number')
        {
            context.circle(snap.x, snap.y, snap.range + 1, 'rgba(102, 225, 117, 0.8)').fill();
        }

        context.circle(event.pageX, event.pageY, balloon_radius, tango).fill();

        prevX = event.pageX;
        prevY = event.pageY;
    }

    function dragEnd(event)
    {
        context.clearRect(0, 0, width, height);
        context.circle(event.pageX, event.pageY, balloon_radius, tango).fill();

        prevX = event.pageX;
        prevY = event.pageY;
    }

    function anchorDragStart(event)
    {
        if (event.snap.locked)
        {
            interact(canvas).snap(false);
            draggingAnchor = event.snap.anchors.closest;
        }
    }

    function anchorDragMove(event)
    {
        if (draggingAnchor)
        {
            var snap = interact(canvas).snap().drag;

            draggingAnchor.x += event.dx;
            draggingAnchor.y += event.dy;

            drawAnchors(anchors, snap.range);
        }
    }

    function anchorDragEnd(event)
    {
        interact(canvas).draggable({
            snap: {
                enabled: true
            }
        });

        draggingAnchor = null;
    }

    function init()
    {
        status.anchorMode.disabled = status.offMode.disabled = status.gridMode.disabled = false;
        status.modes.className = status.modes.className.replace(/ *\<disabled\>/g, '');

        interact(canvas)
            .on('dragstart', dragMove)
            .on('dragmove', dragMove)
            .on('dragend', dragEnd)
            .off('dragstart', anchorDragStart)
            .off('dragmove', anchorDragMove)
            .off('dragend', anchorDragEnd);

        interact(canvas)
            .draggable({
                inertia: {
                  enabled: status.inertia.checked,
                  zeroResumeDelta: false
                },
                snap: {
                    targets: status.gridMode.checked? [gridFunc] : status.anchorMode.checked? anchors : null,
                    enabled: !status.offMode.checked,
                    endOnly: status.endOnly.checked,
                    offset: status.relative.checked? 'startCoords' : null
                }
            });

        if (!status.relative.checked)
        {
            snapOffset.x = snapOffset.y = 0;
        }

        drawSnap(interact(canvas).draggable().snap);
    }

    interact(document).on('DOMContentLoaded', function ()
    {
        canvas = document.getElementById('drag');
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');

        interact(canvas)
            .draggable({
                restrict: {
                    enabled: true,
                    restriction: 'self'
                }
            })
            .on('move down', function(event)
            {
                if ((event.type === 'down' || !event.interaction.pointerIsDown) && status.relative.checked)
                {
                    var rect = interact.getElementRect(canvas);

                    snapOffset.x = event.pageX - rect.left;
                    snapOffset.y = event.pageY - rect.top;

                    drawSnap(interact(canvas).draggable().snap);
                }
            })
            .origin('self')
            .draggable(true);

        guidesCanvas = document.getElementById('grid');
        guidesCanvas.width = width;
        guidesCanvas.height = height;
        guidesContext = guidesCanvas.getContext('2d');

        status = {
            container: document.getElementById('status'),
            modes: document.getElementById('modes'),
            offMode: document.getElementById('off-mode'),
            gridMode: document.getElementById('grid-mode'),
            anchorMode: document.getElementById('anchor-mode'),
            anchorDrag: document.getElementById('drag-anchors'),
            endOnly: document.getElementById('end-only'),
            inertia: document.getElementById('inertia'),
            relative: document.getElementById('relative')
        };

        init();
    });

    window.grid = {
        drawGrid: drawGrid
    };

}(window.interact));
