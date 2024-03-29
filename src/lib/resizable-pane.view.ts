/** @format */

import { AnyVirtualDOM, VirtualDOM } from '@youwol/rx-vdom'
import { BehaviorSubject } from 'rxjs'

export type ResizablePaneOrientation = 'left' | 'right'

export function resizablePanel(
    virtualDOM: AnyVirtualDOM,
    collapsedText: string,
    direction: ResizablePaneOrientation = 'left',
    conf: {
        width$?: BehaviorSubject<number>
        minWidth?: number
        collapsed$?: BehaviorSubject<boolean>
        visible$?: BehaviorSubject<boolean>
        initProperties?: {
            width?: number
            collapsed?: boolean
            visible?: true
        }
    } = {
        width$: new BehaviorSubject(300),
        minWidth: 0,
        collapsed$: new BehaviorSubject(false),
        visible$: new BehaviorSubject(true),
        initProperties: {
            width: 300,
            collapsed: false,
            visible: true,
        },
    },
): VirtualDOM<'div'> {
    const width$ =
        conf.width$ ??
        new BehaviorSubject<number>(conf.initProperties?.width ?? 300)
    const collapsed$ =
        conf.collapsed$ ??
        new BehaviorSubject<boolean>(conf.initProperties?.collapsed ?? false)
    const visible$ =
        conf.visible$ ??
        new BehaviorSubject<boolean>(conf.initProperties?.visible ?? true)
    const minWidth = conf.minWidth ?? 0
    return {
        tag: 'div',
        class: {
            source$: visible$,
            vdomMap: (visible) =>
                visible ? 'd-flex grapes-bg-color fv-text-primary' : 'd-none',
        },
        children: [
            {
                tag: 'div',
                class: {
                    source$: collapsed$,
                    vdomMap: (collapsed) => (collapsed ? 'd-flex' : 'd-none'),
                },
                children: [
                    {
                        tag: 'div',
                        class: `py-1 resizable-panel-${direction}-collapsed`,
                        innerText: collapsedText,
                    },
                ],
                ondblclick: () => {
                    collapsed$.next(false)
                },
            },
            {
                tag: 'div',
                class: {
                    source$: collapsed$,
                    vdomMap: (collapsed) => (collapsed ? 'd-none' : 'd-flex'),
                },
                style: {
                    source$: width$,
                    vdomMap: (w) => ({
                        width: `${w}px`,
                        position: 'relative',
                    }),
                },
                children: [
                    {
                        tag: 'div',
                        class: 'd-flex w-100',
                        children: [virtualDOM],
                    },
                    {
                        tag: 'div',
                        class: `resizable-panel-${direction}-handle`,
                        onmousedown: getOnMouseDownCallback(
                            width$,
                            minWidth,
                            direction,
                        ),
                        ondblclick: () => {
                            collapsed$.next(true)
                        },
                    },
                ],
            },
        ],
    }
}

function resizablePanelMouseDown(
    mouseDownEvent: MouseEvent,
    width$: BehaviorSubject<number>,
    minWidth: number,
    direction: ResizablePaneOrientation,
) {
    const initValue = width$.getValue()
    mouseDownEvent.preventDefault()
    const onMouseMoveCallBack = (mouseMoveEvent: MouseEvent) => {
        const candidateNextWidth =
            direction === 'left'
                ? initValue + (mouseMoveEvent.pageX - mouseDownEvent.pageX)
                : initValue - (mouseMoveEvent.pageX - mouseDownEvent.pageX)
        width$.next(
            candidateNextWidth >= minWidth ? candidateNextWidth : minWidth,
        )
    }
    const oldCursor = document.documentElement.style.cursor
    document.documentElement.style.cursor = 'ew-resize'
    window.addEventListener('mousemove', onMouseMoveCallBack)
    window.addEventListener(
        'mouseup',
        (_) => {
            window.removeEventListener('mousemove', onMouseMoveCallBack)
            document.documentElement.style.cursor = oldCursor
        },
        { once: true },
    )
}

function getOnMouseDownCallback(
    width$: BehaviorSubject<number>,
    minWidth: number,
    direction: ResizablePaneOrientation,
) {
    return (e: MouseEvent) =>
        resizablePanelMouseDown(e, width$, minWidth, direction)
}
