package image.filter.main

import javafx.scene.paint.Color
import tornadofx.*

class Styles : Stylesheet() {
    companion object {
        val zip by cssclass()
    }

    init {
        s(form) {
            padding = box(25.px)
            prefWidth = 400.px

            s(zip) {
                maxWidth = 60.px
                minWidth = maxWidth
            }
        }
        s(imageView){
            fitToWidth = true
            fillWidth = true
            maxWidth = 200.px
            arcWidth = 200.px
            prefWidth = 200.px
            strokeWidth = 200.px
            cellWidth = 100.px
            tabMaxWidth = 200.px

        }
    }
}