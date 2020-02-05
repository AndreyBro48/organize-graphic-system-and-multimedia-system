package image.filter.main

import javafx.beans.property.ObjectProperty
import javafx.beans.property.Property
import javafx.beans.property.StringProperty
import javafx.scene.image.Image
import tornadofx.*
import java.time.LocalDate

class Customer {
    var name by property<String>()
    fun nameProperty() = getProperty(Customer::name)

    var birthday by property<LocalDate>()
    fun birthdayProperty() = getProperty(Customer::birthday)

    var street by property<String>()
    fun streetProperty() = getProperty(Customer::street)

    var zip by property<String>()
    fun zipProperty() = getProperty(Customer::zip)

    var city by property<String>()
    fun cityProperty() = getProperty(Customer::city)

    var image: Image by property<Image>()
    fun imageProperty() = getProperty(Customer::image)

    override fun toString() = name
}

class CustomerModel : ItemViewModel<Customer>(Customer()) {
    val name: StringProperty = bind { item?.nameProperty() }
    val birthday: Property<LocalDate> = bind { item?.birthdayProperty() }
    val street: StringProperty = bind { item?.streetProperty() }
    val zip:StringProperty = bind { item?.zipProperty() }
    val city:StringProperty = bind { item?.cityProperty() }
    val image: ObjectProperty<Image> = bind { item?.imageProperty() }
}
