package ru.brovkin.graphics.controllers

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer

//контроллер для web запросов
@Controller
class LabController {
    //запрос для лабораторной работы №1
    @RequestMapping(value = ["/lab1"])
    fun getLabFirstPage1(): String {
        return "page1"
    }
    //запрос для лабораторной работы №2
    @RequestMapping(value = ["/lab2"])
    fun getLabFirstPage2(): String {
        return "page2"
    }
    //запрос для лабораторной работы №3
    @RequestMapping(value = ["/lab3"])
    fun getLabFirstPage3(): String {
        return "page3"
    }
    //запрос для лабораторной работы №4
    @RequestMapping(value = ["/lab4"])
    fun getLabFirstPage4(): String {
        return "page4"
    }
}