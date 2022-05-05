package dm.webchat.helper;

import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Stream;

import lombok.experimental.UtilityClass;
import static java.util.Objects.isNull;

import java.nio.ByteBuffer;
import java.util.Collection;

@UtilityClass
public class EmptinessHelper {

    public static boolean isEmpty(String string) {
        return string == null || string.trim().isEmpty() || "null".equals(string);
    }

    public static <T> boolean isEmpty(T object) {
        return object == null;
    }

    public static boolean isEmpty(Map<?, ?> map) {
        return map == null || map.isEmpty();
    }

    public static <T> boolean isNotEmpty(T object) {
        return !isEmpty(object);
    }

    public static boolean isNotEmpty(String string) {
        return !isEmpty(string);
    }

    public static boolean isEmpty(byte[] content) {
        return isNull(content) || content.length == 0;
    }

    public static boolean isEmpty(short[] content) {
        return isNull(content) || content.length == 0;
    }

    public static boolean isEmpty(int[] content) {
        return isNull(content) || content.length == 0;
    }

    public static boolean isEmpty(long[] content) {
        return isNull(content) || content.length == 0;
    }

    public static boolean isEmpty(float[] content) {
        return isNull(content) || content.length == 0;
    }

    public static boolean isEmpty(double[] content) {
        return isNull(content) || content.length == 0;
    }

    public static boolean isEmpty(boolean[] content) {
        return isNull(content) || content.length == 0;
    }

    public static boolean isEmpty(char[] content) {
        return isNull(content) || content.length == 0;
    }

    public static boolean isNotEmpty(Collection<?> collection) {
        return !isEmpty(collection);
    }

    public static boolean isEmpty(Collection<?> collection) {
        return isNull(collection) || collection.isEmpty();
    }

    public static boolean isEmpty(Stream<?> stream) {
        return isNull(stream) || stream.count() == 0;
    }

    public static boolean isEmpty(ByteBuffer buffer) {
        return isNull(buffer) || buffer.remaining() == 0;
    }

    public static boolean isNotEmpty(Stream<?> stream) {
        return !isEmpty(stream);
    }

    public static <T> T ifEmpty(T value, T ifEmpty) {
        return isEmpty(value) ? ifEmpty : value;
    }

    public static <T> T ifEmpty(T value, Supplier<T> ifEmpty) {
        return isEmpty(value) ? ifEmpty.get() : value;
    }

    public static <T> void ifNotEmpty(T value, Consumer<T> action) {
        if (isEmpty(value)) {
            return;
        }
        action.accept(value);
    }

    public static <T, R> R ifNotEmpty(T value, Function<T, R> function){
        if(isEmpty(value))
            return null;
        return function.apply(value);
    }

    public static <R> R ifNotEmpty(String value, Function<String, R> function){
        if(isEmpty(value))
            return null;
        return function.apply(value);
    }
}