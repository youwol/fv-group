import { attr$, child$, render } from "@youwol/flux-view"
import { ExpandableGroup } from "../index"




test('simple expandable group', () => {

    let vDOM = ExpandableGroup.simpleExpandableGroup(
        "Example",
        {   id:'content', innerText: 'Hello expandable group!'
        }
    )
    let div = render(vDOM)
    document.body.appendChild(div)
    let title = document.querySelector('span')
    expect(title).toBeTruthy()
    let content = document.getElementById('content')
    expect(content).toBeFalsy()
    title.dispatchEvent(new MouseEvent('click', {bubbles:true}))
    content = document.getElementById('content')
    expect(content).toBeTruthy()
    expect(content.innerText).toEqual( 'Hello expandable group!')
})
