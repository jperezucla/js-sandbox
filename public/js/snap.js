(function(interact)
{
    'use strict';

    var canvas;
    var context;
    var guidesCanvas;
    var guidesContext;
    var width = 600;
    var height = 600;
    var blue = '#2299ee';
    var lightBlue = '#88ccff';
    var tango = '#ff4400';
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

    function drawSnap(snap)
    {
        context.clearRect(0, 0, width, height);
        guidesContext.clearRect(0, 0, width, height);

        drawGrid(snapGrid, snapGrid.offset, snapGrid.range);
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
    }

    function dragEnd(event)
    {
        context.clearRect(0, 0, width, height);
        context.circle(event.pageX, event.pageY, balloon_radius, tango).fill();
    }

    function init()
    {
        interact(canvas)
            .on('dragstart', dragMove)
            .on('dragmove', dragMove)
            .on('dragend', dragEnd)
            .draggable({
                inertia: {
                  enabled: true,
                  zeroResumeDelta: false
                },
                snap: {
                    targets: [gridFunc],
                    enabled: true,
                    endOnly: true,
                    offset: null
                }
            });

        snapOffset.x = snapOffset.y = 0;

        drawSnap(interact(canvas).draggable().snap);
    }

    interact(document).on('DOMContentLoaded', function()
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
            .origin('self')
            .draggable(true);

        guidesCanvas = document.getElementById('grid');
        guidesCanvas.width = width;
        guidesCanvas.height = height;
        guidesContext = guidesCanvas.getContext('2d');

        init();
    });

    window.grid = {
        drawGrid: drawGrid
    };

}(window.interact));
