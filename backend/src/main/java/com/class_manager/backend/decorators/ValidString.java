package com.class_manager.backend.decorators;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Payload;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@NotNull(message = "{field.notnull}")
@NotEmpty(message = "{field.notempty}")
@NotBlank(message = "{field.notblank}")
public @interface ValidString {
    String message() default "{field.invalido}";
    String value() default "";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
