using UnityEditor;
using UnityEngine;

public static class TMPSetup
{
    [MenuItem("Tools/KingsDominos/Import TMP Essentials")]
    public static void Import()
    {
        Debug.Log("KingsDominos: Importing TMP Essentials...");

        TMPro.TMP_PackageResourceImporter.ImportResources(
            true,
            false,
            false
        );

        AssetDatabase.Refresh();

        Debug.Log("KingsDominos: TMP Essentials import completed.");
    }
}
