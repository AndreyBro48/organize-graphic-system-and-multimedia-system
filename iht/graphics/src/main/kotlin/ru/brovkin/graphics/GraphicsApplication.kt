package ru.brovkin.graphics

import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Import

@SpringBootApplication //указывем что этот класса является классом приложения Spring Boot
@EnableAutoConfiguration //разрешаем автоконфигурацию приложения
@ComponentScan(basePackages = ["ru.brovkin.graphics"]) //указываем базовы пакет прилоэения для обнаружения вспомоагтельных элементов
class GraphicsApplication

//точка входа в приложение
fun main(args: Array<String>) {
	runApplication<GraphicsApplication>(*args)
}
