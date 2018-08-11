import java.util.*;

public class BubbleSort {
    public static void main(String[] args) {
        int[] arr = {65, 30, 70, 75, 40, 21, 80, 11, 8, 99};
        new BubbleSort().sort(arr);
        System.out.println(Arrays.toString(arr));

    }
    public void sort(int[] arr) {
        int length = arr.length;
        for (int i = 0; i < length -1; i++) {
            for (int j = 0; j < length - 1 - i; j++) {
                if (arr[j] < arr[j+1]) {
                    arr[j] = arr[j] ^ arr[j+1];
                    arr[j+1] = arr[j] ^ arr[j+1];
                    arr[j] = arr[j] ^ arr[j+1];
                }
            }
        }

    }
}
