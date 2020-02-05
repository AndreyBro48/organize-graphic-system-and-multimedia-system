package image.filter.main

import javafx.scene.image.Image
import javafx.scene.image.WritableImage
import tornadofx.*
import java.io.File
import javax.imageio.ImageIO


class CustomerForm : View("Register Customer") {
//    val model : CustomerModel by inject()
//
//    override val root = form {
//        imageview(model.image)
//        fieldset("Personal Information", FontAwesomeIconView(USER)) {
//            field("Name") {
//                textfield(model.name).required()
//            }
//
//            field("Birthday") {
//                datepicker(model.birthday)
//            }
//        }
//
//        fieldset("Address", FontAwesomeIconView(HOME)) {
//            field("Street") {
//                textfield(model.street).required()
//            }
//            field("Zip / City") {
//                textfield(model.zip) {
//                    //addClass(zip)
//                    required()
//                }
//                textfield(model.city).required()
//            }
//        }
//
//        button("Save") {
//            action {
//                model.commit {
//                    Bitmap
//                    model.item.image = Image("1.png")
//
//                    val customer = model.item
//                    Notifications.create()
//                            .title("Customer saved!")
//                            .text("${customer.name} was born ${customer.birthday}\nand lives in\n${customer.street}, ${customer.zip} ${customer.city}")
//                            .owner(this)
//                            .showInformation()
//                }
//            }
//
//            enableWhen(model.valid)
//        }
//    }

    private val img = getImage("D:/1.png")
    private val wImg1 = WritableImage(img.pixelReader, img.width.toInt(), img.height.toInt())

    private val width = 400
    private val height = 400

    override val root = borderpane {
        center {
            hbox {
                stackpane {
                    imageview(wImg1).apply {
                        makePixelsDuller(wImg1)
                        makePixelsDuller(wImg1)
                        makePixelsDuller(wImg1)
                    }
                    hboxConstraints {
                        prefWidth = 400.0
                        prefHeight = 400.0
                    }
                }
            }
        }
    }

    private fun getImage(str:String) : Image{
        val file = File(str)
        val image1 = ImageIO.read(file)
        val image2 = Image(file.inputStream())
        image2.getImpl
        return
    }
    private fun makePixelsDuller(image: WritableImage) {
        val pixelReader = image.pixelReader
        val pixelWriter = image.pixelWriter

        // Determine the color of each pixel in a specified row
        for (i in 0 until image.width.toInt()) {
            for (j in 0 until image.height.toInt()) {
                val color = pixelReader.getColor(i, j)
                pixelWriter.setColor(i, j, color.darker())
            }
        }
    }

}