package com.class_manager.backend.utils;

import java.lang.reflect.Field;

public class Patcher {

	/**
	 * Updates the fields of a target object with non-null values from a source
	 * object of the same type.
	 *
	 * This method uses Java Reflection to iterate over all declared fields of the
	 * source object.
	 * If a field's value is not null in the source object, it will be copied to the
	 * corresponding field in the target object.
	 *
	 * Note: This method assumes that both objects are of the same class and have
	 * accessible fields.
	 *
	 * @param <T>    the type of the objects
	 * @param target the object to be updated
	 * @param source the object containing the updated values
	 * @throws IllegalAccessException if the field access fails
	 */
	public static <T> void patch(T target, T source) throws IllegalAccessException {
		Class<?> clazz = source.getClass();
		Field[] fields = clazz.getDeclaredFields();

		for (Field field : fields) {
			field.setAccessible(true);
			Object value = field.get(source);
			if (value != null) {
				field.set(target, value);
			}
			field.setAccessible(false);
		}
	}

}
